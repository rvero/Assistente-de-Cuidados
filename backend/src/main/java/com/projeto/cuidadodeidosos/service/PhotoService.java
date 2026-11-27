package com.projeto.cuidadodeidosos.service;

import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import javax.imageio.ImageIO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PhotoService {
    private final String cloud, key, secret;
    public PhotoService(@Value("${CLOUDINARY_CLOUD_NAME:}") String cloud,
                        @Value("${CLOUDINARY_API_KEY:}") String key,
                        @Value("${CLOUDINARY_API_SECRET:}") String secret) {
        this.cloud = cloud; this.key = key; this.secret = secret;
    }
    public void validarUrl(String url, Long owner) {
        if (url == null || url.isBlank()) return;
        String prefix = "https://res.cloudinary.com/" + cloud + "/image/upload/";
        if (cloud.isBlank() || !url.startsWith(prefix) || !url.substring(prefix.length()).matches("v[0-9]+/cuidadores/" + owner + "/[a-f0-9-]+[.]jpg"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie a foto pelo seletor de imagens.");
    }
    public String enviar(MultipartFile file, Long owner) {
        if (cloud.isBlank() || key.isBlank() || secret.isBlank())
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "O envio de fotos ainda não está configurado.");
        if (file.isEmpty() || file.getSize() > 2 * 1024 * 1024)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escolha uma imagem JPG ou PNG de até 2 MB.");
        byte[] image = preparar(file);
        String etapa = "preparar-envio";
        try {
            String id = "cuidadores/" + owner + "/" + UUID.randomUUID();
            String timestamp = Long.toString(Instant.now().getEpochSecond());
            String signature = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-1").digest(
                ("public_id=" + id + "&timestamp=" + timestamp + secret).getBytes(StandardCharsets.UTF_8)));
            var form = new LinkedMultiValueMap<String, Object>();
            form.add("file", new ByteArrayResource(image) { @Override public String getFilename() { return "perfil.jpg"; } });
            form.add("public_id", id); form.add("timestamp", timestamp);
            form.add("api_key", key); form.add("signature", signature);
            etapa = "enviar-cloudinary";
            var response = client().post()
                .uri("https://api.cloudinary.com/v1_1/" + cloud + "/image/upload")
                .contentType(MediaType.MULTIPART_FORM_DATA).body(form).retrieve().body(Map.class);
            etapa = "validar-resposta";
            String url = response == null ? null : (String) response.get("secure_url");
            if (url == null) throw new IOException("Missing upload URL");
            validarUrl(url, owner);
            return url;
        } catch (Exception e) {
            String status = "sem-resposta", categoria = "erro-interno";
            if (e instanceof org.springframework.web.client.RestClientResponseException http) {
                status = Integer.toString(http.getStatusCode().value());
                String body = http.getResponseBodyAsString().toLowerCase(Locale.ROOT);
                categoria = body.contains("signature") ? "assinatura" :
                    body.contains("api_key") || body.contains("api key") ? "chave-api" :
                    body.contains("cloud name") || body.contains("disabled") ? "ambiente-cloudinary" :
                    body.contains("quota") || body.contains("limit") ? "limite-cloudinary" : "rejeitado-cloudinary";
            } else if (e instanceof org.springframework.web.client.ResourceAccessException) categoria = "conexao-cloudinary";
            String causas = e.getClass().getSimpleName();
            for (Throwable cause=e.getCause(); cause!=null && causas.length()<250; cause=cause.getCause()) causas += "/"+cause.getClass().getSimpleName();
            // Never log response bodies, exception messages, signatures, credentials or image bytes.
            org.slf4j.LoggerFactory.getLogger(PhotoService.class).warn(
                "Falha upload foto: etapa={}, status={}, categoria={}, tipos={}", etapa, status, categoria, causas);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Não foi possível enviar a foto. Tente novamente.");
        }
    }
    public void excluirAposCommit(String url, Long owner) {
        if (url == null || url.isBlank()) return;
        validarUrl(url, owner);
        String id = url.substring(url.indexOf("/cuidadores/") + 1, url.length() - 4);
        depoisCommit(() -> {
            var params = new LinkedMultiValueMap<String,Object>();
            String timestamp = Long.toString(Instant.now().getEpochSecond());
            params.add("public_id", id); params.add("timestamp", timestamp); params.add("invalidate", "true"); params.add("api_key", key);
            try { params.add("signature", HexFormat.of().formatHex(MessageDigest.getInstance("SHA-1").digest(("invalidate=true&public_id="+id+"&timestamp="+timestamp+secret).getBytes(StandardCharsets.UTF_8)))); }
            catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
            client().post().uri("https://api.cloudinary.com/v1_1/"+cloud+"/image/destroy").contentType(MediaType.APPLICATION_FORM_URLENCODED).body(params).retrieve().toBodilessEntity();
        }, owner);
    }
    public void excluirContaAposCommit(Long owner) {
        if (cloud.isBlank() || key.isBlank() || secret.isBlank()) return;
        depoisCommit(() -> {
            String cursor = null;
            do {
                final String next = cursor;
                var response = client().delete().uri(builder -> {
                    builder.scheme("https").host("api.cloudinary.com").path("/v1_1/"+cloud+"/resources/image/upload").queryParam("prefix", "cuidadores/"+owner+"/").queryParam("invalidate", "true");
                    if (next != null) builder.queryParam("next_cursor", next);
                    return builder.build();
                }).headers(headers -> headers.setBasicAuth(key,secret)).retrieve().body(Map.class);
                cursor = response == null ? null : (String) response.get("next_cursor");
            } while (cursor != null);
        }, owner);
    }
    private RestClient client() {
        var factory = new JdkClientHttpRequestFactory(java.net.http.HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
        factory.setReadTimeout(Duration.ofSeconds(25));
        return RestClient.builder().requestFactory(factory).build();
    }
    private void depoisCommit(Runnable cleanup, Long owner) {
        org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(new org.springframework.transaction.support.TransactionSynchronization() {
            @Override public void afterCommit() {
                Thread.startVirtualThread(() -> {
                    for (int attempt=0; attempt<3; attempt++) {
                        try { cleanup.run(); return; }
                        catch (Exception e) {
                            if (attempt==2) org.slf4j.LoggerFactory.getLogger(PhotoService.class).error("Falha ao excluir fotos Cloudinary do usuário {}. Verifique a Media Library.", owner);
                        }
                    }
                });
            }
        });
    }
    private byte[] preparar(MultipartFile file) {
        try (var stream = ImageIO.createImageInputStream(file.getInputStream())) {
            var readers = ImageIO.getImageReaders(stream);
            if (!readers.hasNext()) throw new IOException();
            var reader = readers.next();
            try {
                reader.setInput(stream);
                String format = reader.getFormatName();
                int width = reader.getWidth(0), height = reader.getHeight(0);
                if (!(format.equalsIgnoreCase("JPEG") || format.equalsIgnoreCase("PNG")) || width < 1 || height < 1 || (long) width * height > 12_000_000) throw new IOException();
                BufferedImage source = reader.read(0);
                double scale = Math.min(1, 800.0 / Math.max(width, height));
                BufferedImage result = new BufferedImage(Math.max(1,(int)(width*scale)), Math.max(1,(int)(height*scale)), BufferedImage.TYPE_INT_RGB);
                var graphics = result.createGraphics();
                graphics.setColor(java.awt.Color.WHITE); graphics.fillRect(0,0,result.getWidth(),result.getHeight());
                graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
                graphics.drawImage(source,0,0,result.getWidth(),result.getHeight(),null); graphics.dispose();
                var bytes = new ByteArrayOutputStream();
                ImageIO.write(result,"JPEG",bytes);
                return bytes.toByteArray();
            } finally { reader.dispose(); }
        } catch (IOException | RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escolha uma imagem JPG ou PNG válida, com até 12 megapixels.");
        }
    }
}

FROM eclipse-temurin:25-jdk AS build
WORKDIR /build
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
COPY src src
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /build/target/cuidado-de-idosos-0.0.1-SNAPSHOT.jar app.jar
USER 10001
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=65.0 -XX:+ExitOnOutOfMemoryError"
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "app.jar"]

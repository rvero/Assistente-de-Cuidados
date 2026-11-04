package com.projeto.cuidadodeidosos.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name="contatos",uniqueConstraints=@UniqueConstraint(name="uk_contato_par",columnNames={"familia_id","cuidador_id"}))
public class Contato {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="familia_id",nullable=false) private User familia;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="cuidador_id",nullable=false) private User cuidador;
    @Column(name="criado_em",nullable=false) private Instant criadoEm=Instant.now();
    public Long getId(){return id;} public User getFamilia(){return familia;} public void setFamilia(User u){familia=u;}
    public User getCuidador(){return cuidador;} public void setCuidador(User u){cuidador=u;}
    public Instant getCriadoEm(){return criadoEm;}
}

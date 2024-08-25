package pl.lodz.p.it.socialfridgemicroservice.common;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@EqualsAndHashCode(callSuper = false)
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AbstractEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Setter(AccessLevel.NONE)
    private Long id;

    @Version
    @Setter(AccessLevel.NONE)
    @Column(nullable = false)
    private Long version;

    @CreatedBy
    @Setter
    @Column(name = "created_by")
    private String createdBy;

    @LastModifiedBy
    @Setter
    @Column(name = "last_modified_by")
    private String lastModifiedBy;

    @Temporal(TemporalType.TIMESTAMP)
    @CreatedDate
    @Setter
    @Column(nullable = false, updatable = false, name = "creation_date_time")
    private LocalDateTime creationDateTime;

    @Temporal(TemporalType.TIMESTAMP)
    @LastModifiedDate
    @Setter
    @Column(name = "last_modification_date_time")
    private LocalDateTime lastModificationDateTime;
}
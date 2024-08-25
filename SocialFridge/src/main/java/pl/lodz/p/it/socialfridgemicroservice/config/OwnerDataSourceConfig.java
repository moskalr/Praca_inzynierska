package pl.lodz.p.it.socialfridgemicroservice.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EntityScan("pl.lodz.p.it.socialfridgemicroservice.entity")
@EnableTransactionManagement
@EnableJpaRepositories(
        basePackages = {"pl.lodz.p.it.socialfridgemicroservice.repository", "pl.lodz.p.it.socialfridgemicroservice.service.impl.test.containers"},
        entityManagerFactoryRef = "ownerEntityManagerFactory",
        transactionManagerRef = "ownerTransactionManager"
)
public class OwnerDataSourceConfig {
    private int txTimeout = 30;

    @Primary
    @Bean(name = "ownerDatasource")
    public DataSource ownerDatasource() {
        return DataSourceBuilder.create()
                .url("jdbc:postgresql://sf_postgres:5432/sf")
                .username("sf")
                .password("password")
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    @Primary
    @Bean(name = "ownerEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean ownerEntityManagerFactory(EntityManagerFactoryBuilder builder,
                                                                            @Qualifier("ownerDatasource") DataSource dataSource) {
        return builder.dataSource(dataSource)
                .packages("pl.lodz.p.it.socialfridgemicroservice.entity")
                .persistenceUnit("owner")
                .properties(getHibernateProperties())
                .build();
    }

    private Map<String, Object> getHibernateProperties() {
        Map<String, Object> hibernateProperties = new HashMap<>();
        hibernateProperties.put("hibernate.hbm2ddl.auto", "create");
        hibernateProperties.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        hibernateProperties.put("hibernate.show_sql", true);
        hibernateProperties.put("hibernate.check_nullability", true);
        return hibernateProperties;
    }

    @Primary
    @Bean(name = "ownerTransactionManager")
    public PlatformTransactionManager ownerTransactionManager(@Qualifier("ownerEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        JpaTransactionManager jpaTransactionManager = new JpaTransactionManager(entityManagerFactory);
        jpaTransactionManager.setDefaultTimeout(txTimeout);
        return jpaTransactionManager;
    }
}

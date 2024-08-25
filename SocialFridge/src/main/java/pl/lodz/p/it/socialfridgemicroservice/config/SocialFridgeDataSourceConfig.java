package pl.lodz.p.it.socialfridgemicroservice.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        basePackages = {"pl.lodz.p.it.socialfridgemicroservice.service.impl", "pl.lodz.p.it.socialfridgemicroservice.repository"," pl.lodz.p.it.socialfridgemicroservice.service.impl.test.containers"},
        entityManagerFactoryRef = "fridgeEntityManagerFactory",
        transactionManagerRef = "fridgeTransactionManager"
)
public class SocialFridgeDataSourceConfig {
    private int txTimeout = 30;


    @Bean(name = "fridgeDatasource")
    public DataSource fridgeDatasource() {
        return DataSourceBuilder.create()
                .url("jdbc:postgresql://sf_postgres:5432/sf")
                .username("mzls")
                .password("password")
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    @Bean(name = "fridgeEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean fridgeEntityManagerFactory(EntityManagerFactoryBuilder builder,
                                                                             @Qualifier("fridgeDatasource") DataSource dataSource) {
        return builder.dataSource(dataSource)
                .packages("pl.lodz.p.it.socialfridgemicroservice.entity")
                .persistenceUnit("fridge")
                .properties(hibernateProperties())
                .build();
    }

    @Bean(name = "fridgeTransactionManager")
    public PlatformTransactionManager fridgeTransactionManager(@Qualifier("fridgeEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        JpaTransactionManager jpaTransactionManager = new JpaTransactionManager(entityManagerFactory);
        jpaTransactionManager.setDefaultTimeout(txTimeout);
        return jpaTransactionManager;
    }

    private Map<String, Object> hibernateProperties() {
        Map<String, Object> properties = new HashMap<>();
        properties.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        return properties;
    }
}

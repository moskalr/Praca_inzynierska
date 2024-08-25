FROM maven:3.8.4-openjdk-17 AS build
USER root

COPY . /opt/social-fridge-microservice
COPY pom.xml /opt/

WORKDIR /opt/social-fridge-microservice

RUN mvn --version
RUN mvn clean install -DskipTests

FROM openjdk:17-jdk-alpine
RUN mkdir -p /opt/build/libs/
WORKDIR /opt/social-fridge-microservice

COPY --from=build /opt/social-fridge-microservice/target/social-fridge-microservice-1.0.0.jar /opt/build/libs/
ENTRYPOINT ["java", "-jar", "/opt/build/libs/social-fridge-microservice-1.0.0.jar"]

FROM maven:3.8.4-openjdk-17 AS build
USER root

COPY . /opt/account-microservice
COPY pom.xml /opt/

WORKDIR /opt/account-microservice

RUN mvn --version
RUN mvn clean install -DskipTests

FROM openjdk:17-jdk-alpine
RUN mkdir -p /opt/build/libs/
WORKDIR /opt/account-microservice

COPY --from=build /opt/account-microservice/target/*.jar /opt/build/libs/
ENTRYPOINT ["java", "-jar", "/opt/build/libs/account-microservice-1.0.0.jar"]

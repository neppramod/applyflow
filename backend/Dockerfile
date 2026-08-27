# Step 1: Compile using matching JDK 21 Alpine image
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Step 2: Match Runtime with clean JRE 21 Alpine container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN mkdir ./data

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

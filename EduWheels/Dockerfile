# Build stage
FROM openjdk:17-jdk-slim AS build

# Set JAVA_HOME and PATH
ENV JAVA_HOME=/usr/local/openjdk-17
ENV PATH="${JAVA_HOME}/bin:${PATH}"

WORKDIR /app

# Copy necessary files from the EduWheels folder
COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY src src/



# Make mvnw executable
RUN chmod +x mvnw

# Build the app
RUN ./mvnw clean package -DskipTests

# Final stage
FROM openjdk:17-jdk-slim

# Set JAVA_HOME and PATH for the final image
ENV JAVA_HOME=/usr/local/openjdk-17
ENV PATH="${JAVA_HOME}/bin:${PATH}"

WORKDIR /app

# Copy the jar file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the portdocker build -t eduwheels .
EXPOSE 8080

# Run the app
CMD ["java", "-jar", "app.jar"]

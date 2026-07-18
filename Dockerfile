# ── Build stage ──
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml ./
COPY platform-*/pom.xml platform-*/
COPY platform-audit/pom.xml platform-audit/
COPY platform-auth/pom.xml platform-auth/
COPY platform-document/pom.xml platform-document/
COPY platform-search/pom.xml platform-search/
COPY platform-ai/pom.xml platform-ai/
COPY platform-neo4j/pom.xml platform-neo4j/
COPY platform-workspace/pom.xml platform-workspace/
COPY platform-observability/pom.xml platform-observability/
COPY platform-api/pom.xml platform-api/

RUN mvn dependency:go-offline -B -q || true

COPY . .
RUN mvn package -pl platform-api -am -DskipTests -B -q

# ── Runtime stage ──
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app appuser

COPY --from=build /app/platform-api/target/platform-api-*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

USER appuser
ENTRYPOINT ["java", "-jar", "app.jar"]

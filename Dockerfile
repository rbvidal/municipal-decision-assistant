# ──────────────────────────────────────────────────────────
# Municipal Decision Assistant — Production Dockerfile
# Multi-stage build targeting <400MB final image.
# ──────────────────────────────────────────────────────────

# ── Build stage ──
FROM eclipse-temurin:21-jdk-alpine AS build
RUN apk add --no-cache nodejs npm maven
WORKDIR /app

# Layer 1: POM files (cache dependencies)
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

# Layer 2: Source code and build
COPY . .
RUN mvn package -pl platform-api -am -DskipTests -Dskip.spotbugs=true -Dskip.checkstyle=true -B -q

# ── Runtime stage ──
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Non-root user with explicit UID/GID
RUN addgroup --system --gid 1001 appgroup \
    && adduser --system --uid 1001 --ingroup appgroup appuser

COPY --from=build /app/platform-api/target/platform-api-*.jar app.jar

EXPOSE 8080

# Health check via Actuator (allow 40s startup grace period)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=40s \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

# Production JVM: 75% container memory, ZGC for low latency
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseZGC \
  -XX:+ExitOnOutOfMemoryError \
  -Djava.security.egd=file:/dev/./urandom"

USER appuser
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

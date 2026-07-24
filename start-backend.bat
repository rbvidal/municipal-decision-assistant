@echo off
cd /d C:\Users\User\projects\intellij\municipal-decision-assistant
call kill-8080.bat
timeout /t 3 /nobreak >nul
mvn spring-boot:run -pl platform-api -Dspring-boot.run.profiles=dev -Dskip.frontend.build=true

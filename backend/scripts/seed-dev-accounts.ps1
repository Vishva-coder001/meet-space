# Explicit local-development seed. Never runs during Spring Boot startup.
$ErrorActionPreference="Stop"
$root=Split-Path -Parent $PSScriptRoot
$envFile=Join-Path $root ".env"
$settings=@{}
Get-Content $envFile | ForEach-Object {if($_ -match '^\s*([^#=]+)=(.*)$'){$settings[$matches[1].Trim()]=$matches[2]}}
foreach($name in "DATABASE_URL","DATABASE_USERNAME","DATABASE_PASSWORD","DEV_SEED_EMPLOYEE_A_PASSWORD","DEV_SEED_EMPLOYEE_B_PASSWORD","DEV_SEED_ADMIN_PASSWORD"){if([string]::IsNullOrWhiteSpace($settings[$name])){throw "Missing $name in backend/.env."}}
foreach($urlName in "CORS_ALLOWED_ORIGIN","FRONTEND_BASE_URL"){$url=$settings[$urlName];if($url -and $url -notmatch '^https?://(localhost|127\.0\.0\.1)(:\d+)?/?$'){throw "Refusing to seed: $urlName is not local."}}
$env:DATABASE_URL=$settings["DATABASE_URL"];$env:DATABASE_USERNAME=$settings["DATABASE_USERNAME"];$env:DATABASE_PASSWORD=$settings["DATABASE_PASSWORD"];$env:DEV_SEED_EMPLOYEE_A_PASSWORD=$settings["DEV_SEED_EMPLOYEE_A_PASSWORD"];$env:DEV_SEED_EMPLOYEE_B_PASSWORD=$settings["DEV_SEED_EMPLOYEE_B_PASSWORD"];$env:DEV_SEED_ADMIN_PASSWORD=$settings["DEV_SEED_ADMIN_PASSWORD"]
$cp=Join-Path $env:TEMP "meetspace-dev-seed-classpath.txt"
Push-Location $root
try{mvn -q dependency:build-classpath "-Dmdep.outputFile=$cp";$classpath=Get-Content -Raw $cp;@'
import java.sql.*; import java.util.*; import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
var encoder=new BCryptPasswordEncoder();
var accounts=List.of(new String[]{"employee.a@meetspace.local","DEV-EMP-A","Employee","A","Engineering","EMPLOYEE",System.getenv("DEV_SEED_EMPLOYEE_A_PASSWORD")},new String[]{"employee.b@meetspace.local","DEV-EMP-B","Employee","B","Operations","EMPLOYEE",System.getenv("DEV_SEED_EMPLOYEE_B_PASSWORD")},new String[]{"admin@meetspace.local","DEV-ADMIN","Admin","User","Workplace Operations","ADMIN",System.getenv("DEV_SEED_ADMIN_PASSWORD")});
try(var c=DriverManager.getConnection(System.getenv("DATABASE_URL"),System.getenv("DATABASE_USERNAME"),System.getenv("DATABASE_PASSWORD"))){c.setAutoCommit(false);try(var u=c.prepareStatement("insert into users(id,email,password_hash,role,is_active,email_verified) values(gen_random_uuid(),?,?,?,?,true) on conflict(email) do update set password_hash=excluded.password_hash,role=excluded.role,is_active=true,email_verified=true returning id");var e=c.prepareStatement("insert into employees(user_id,employee_code,first_name,last_name,department) values(?,?,?,?,?) on conflict(user_id) do update set employee_code=excluded.employee_code,first_name=excluded.first_name,last_name=excluded.last_name,department=excluded.department")){for(var a:accounts){u.setString(1,a[0]);u.setString(2,encoder.encode(a[6]));u.setString(3,a[5]);u.setBoolean(4,true);var r=u.executeQuery();r.next();var id=r.getObject(1,java.util.UUID.class);e.setObject(1,id);e.setString(2,a[1]);e.setString(3,a[2]);e.setString(4,a[3]);e.setString(5,a[4]);e.executeUpdate();}}c.commit();System.out.println("Development accounts seeded.");}
/exit
'@ | jshell --class-path $classpath}finally{Pop-Location;Remove-Item -LiteralPath $cp -ErrorAction SilentlyContinue}
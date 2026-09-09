# 🏭 Backend API - Gestión de Activos y Mantenimiento Industrial

> **API RESTful de alto rendimiento desarrollada con Laravel 11, PHP 8.3, MySQL 8, Sanctum RBAC, Action Pattern y Event-Driven Architecture.**

![PHP 8.3](https://img.shields.io/badge/PHP-8.3-777BB4?logo=php&logoColor=white)
![Laravel 11](https://img.shields.io/badge/Laravel-11.x-FF2D20?logo=laravel&logoColor=white)
![Sanctum](https://img.shields.io/badge/Auth-Laravel_Sanctum-red)
![OpenAPI 3.1](https://img.shields.io/badge/OpenAPI-3.1_Scramble-green)
![Tests](https://img.shields.io/badge/Tests-37_Passing_(150_Assertions)-44CC11?logo=checkmarx&logoColor=white)

---

## 📌 Arquitectura Backend

- **Action Classes:** Desacoplamiento de la lógica de negocio mediante Single Responsibility Principle (`app/Actions`).
- **Domain Events:** `CriticalIncidentReported` despachado para transiciones de estado de activos y notificaciones automáticas (`app/Events`, `app/Listeners`).
- **Thin Controllers:** Los controladores únicamente coordinan la entrada HTTP mediante Form Requests (`app/Http/Requests`) y transforman la respuesta con API Resources (`app/Http/Resources`).
- **Query Scopes Dinámicos:** Búsqueda full-text, ordenamiento seguro y filtros por Enums tipados en modelos Eloquent (`app/Models`).
- **Control de Acceso Granular:** Laravel Policies con bypass para Super-Admin (`app/Policies`, `AppServiceProvider`).
- **Seguridad OWASP:** Rate limiting (`throttle:auth` 5/min y `throttle:api` 60/min), protección de Mass Assignment y validación estricta de parámetros.

---

## 🧪 Pruebas Automatizadas

```bash
php artisan test
```

```
  PASS  Tests\Unit\ExampleTest
  PASS  Tests\Feature\Asset\AssetManagementTest (8 tests)
  PASS  Tests\Feature\Auth\AuthenticationTest (8 tests)
  PASS  Tests\Feature\Catalog\CatalogManagementTest (4 tests)
  PASS  Tests\Feature\Dashboard\DashboardStatsTest (2 tests)
  PASS  Tests\Feature\Incident\IncidentManagementTest (5 tests)
  PASS  Tests\Feature\Maintenance\MaintenanceManagementTest (6 tests)
  PASS  Tests\Feature\Security\RateLimitingTest (2 tests)

  Tests:    37 passed (150 assertions)
```

---

## 🔑 Credenciales de Prueba

| Rol | Email | Password |
| :--- | :--- | :--- |
| **Administrador** | `admin@example.com` | `password` |
| **Supervisor** | `supervisor@example.com` | `password` |
| **Técnico** | `tecnico@example.com` | `password` |
| **Usuario** | `usuario@example.com` | `password` |

---

## 📖 Documentación de la API

- **OpenAPI / Swagger UI:** `http://127.0.0.1:8000/docs/api`
- **OpenAPI JSON:** `http://127.0.0.1:8000/docs/api.json` o `backend/api.json`
- **Postman Collection v2.1:** `backend/docs/postman_collection.json`

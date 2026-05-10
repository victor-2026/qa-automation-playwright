# FinTech Portfolio Plan

## Overview

This plan outlines a 3-project portfolio to cover FinTech testing requirements from job postings:

| Requirement | Coverage |
|-------------|-----------|
| Advanced C# / .NET | ✅ 100% |
| PostgreSQL (tuning/indexing) | ⚠️ 70% |
| Transactions, Wallets | ✅ 100% |
| High-load architecture | ✅ 100% |
| RabbitMQ / Kafka | ✅ 100% |
| Microservices | ✅ 100% |
| Cloud (GCP) | ✅ 100% |
| Kubernetes | ✅ 100% |
| Mobile platforms | ❌ 0% |

**Total coverage: 9/10 requirements**

---

## Project 1: .NET FinTech API (Alvor Bank Fork)

### Source
Fork from: https://github.com/gustavojofelix/alvor-bank

### Architecture
- **Services**: IAM, Customer, Account, Transaction
- **Database**: PostgreSQL (one per service)
- **Message Queue**: RabbitMQ
- **Gateway**: YARP API Gateway
- **Architecture**: Clean Architecture + CQRS

### Additions Required
| Addition | Description |
|----------|-------------|
| GitLab CI | `.gitlab-ci.yml` with build/test/deploy stages |
| xUnit Tests | Integration tests for API endpoints |
| k6 Load Tests | Stress testing for transaction API |

### Deliverables
- [ ] GitLab repository created
- [ ] Alvor Bank forked
- [ ] `.gitlab-ci.yml` added
- [ ] xUnit integration tests added
- [ ] k6 load tests added

---

## Project 2: Terraform Cloud Deployment

### Purpose
Deploy Project 1 to Google Cloud Platform (GCP)

### Components
| Component | Purpose |
|-----------|---------|
| GKE Cluster | Kubernetes for microservices |
| Cloud SQL | PostgreSQL managed service |
| Cloud Pub/Sub | RabbitMQ alternative (GCP native) |
| Cloud Run | Serverless containers |
| Terraform modules | Infrastructure as Code |

### Deliverables
- [ ] Terraform GCP modules
- [ ] GKE manifests
- [ ] CI/CD integration with GitLab

---

## Project 3: Mobile API (Optional)

### Purpose
Cover mobile testing requirements

### Scope
- ASP.NET Core API for mobile backend
- JSON API responses
- Authentication (JWT)

### Deliverables
- [ ] Mobile API project
- [ ] xUnit tests
- [ ] CI/CD pipeline

---

## Requirements Coverage Matrix

| Job Requirement | Project 1 | Project 2 | Project 3 |
|-----------------|-----------|------------|------------|
| Advanced C# / .NET | ✅ | - | ✅ |
| PostgreSQL | ✅ (basic) | ✅ (managed) | ✅ |
| Tuning/Indexing | ⚠️ (basic) | - | - |
| Transactions/Wallets | ✅ | - | - |
| High-load | ✅ (k6) | ✅ (GKE) | - |
| RabbitMQ/Kafka | ✅ | ✅ (Pub/Sub) | - |
| Microservices | ✅ | - | - |
| GitLab CI/CD | ✅ | ✅ | ✅ |
| GCP | - | ✅ | - |
| AWS | - | ⚠️ (optional) | - |
| Kubernetes | - | ✅ | - |
| Mobile | - | - | ⚠️ |

---

## Implementation Order

```
1. Project 1: Fork Alvor Bank → Add GitLab CI → Add xUnit tests → Add k6
   └─ Timeline: 1-2 weeks

2. Project 2: Terraform GCP modules → GKE manifests → CI integration
   └─ Timeline: 2-3 weeks

3. Project 3: Mobile API → Tests → CI
   └─ Timeline: 1 week (optional)
```

---

## References

### Source Projects
- [Alvor Bank](https://github.com/gustavojofelix/alvor-bank) - .NET 10 banking platform
- [run-aspnetcore-microservices](https://github.com/aspnetrun/run-aspnetcore-microservices) - e-commerce with payment
- [dotnet-core-micro-rabbit](https://github.com/dpedwards/dotnet-core-micro-rabbit) - pure RabbitMQ messaging

### Terraform GCP
- HashiCorp Terraform GCP modules
- Google Cloud SQL for PostgreSQL
- GKE autopilot

---

## Next Steps

1. **Create GitLab account** (if not exists)
2. **Fork Alvor Bank** to GitLab
3. **Add GitLab CI pipeline**
4. **Add xUnit integration tests**
5. **Add k6 load tests**

---

*Created: 2026-05-10*
*Status: Planning*
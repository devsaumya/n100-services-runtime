# 🚀 N100 Services Runtime

The "Workload" repository for the Home Platform. This is where IoT stacks, personal apps, and data pipelines live. Managed entirely via GitOps with support for Canary deployments.

## 📁 1. Repository Structure
- **`apps/`**: Base manifests for all services (IoT, API, Monitoring).
- **`base/`**: Shared core resources (NetworkPolicies, ResourceQuotas).
- **`environments/`**: Kustomize overlays for `dev` and `prod`.
- **`tools/`**: Automation scripts (e.g., Backstage Catalog Generator).

---

## 🏗️ 2. The IoT Stack
A production-grade messaging and telemetry pipeline:
1.  **EMQX**: High-availability MQTT broker.
2.  **Provisioning API**: Automated per-device unique identity registration.
3.  **Node-RED**: Stream processing flows (MQTT -> SQL/Parquet).
4.  **InfluxDB/Postgres**: Dual-sink telemetry storage.

---

## 🔁 3. GitOps Workflow
To add or update a service:
1.  Add your manifests to `apps/<app-name>/`.
2.  Add a reference in `environments/prod/iot/kustomization.yaml`.
3.  `git commit -m "feat: add <app-name>"`
4.  `git push`
5.  Argo CD will detect the change and deploy it.

### Canary Deployments
Critical services (like Node-RED) use **Argo Rollouts**:
```yaml
strategy:
  canary:
    steps:
      - setWeight: 20
      - pause: { duration: 60s }
      - analysis: { templateName: success-rate }
```

---

## 📊 4. Developer Experience
- **Backstage**: All apps in this repo are automatically discovered and cataloged.
- **CI/CD**: Every push triggers a **Trivy security scan** and an automated build.

---

## 🛡️ 5. Resource Controls
All production workloads are governed by:
- **ResourceQuotas**: Hard limits per namespace.
- **LimitRanges**: Default requests/limits for every pod.
- **NetworkPolicies**: Strict "Default Deny" traffic rules.

---

## 🎨 System Architecture
![Hybrid Architecture](../nas-k8s-foundation/docs/assets/hybrid_architecture.png)

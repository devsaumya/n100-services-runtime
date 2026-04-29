# 🚀 N100 Services Runtime

The "Workload" repository for the Home Platform. This is where IoT stacks, personal apps, and data pipelines live. Managed entirely via GitOps with support for Canary deployments.

## 📍 Where to Start

- **`apps/`**: Base Kubernetes manifests and source code for all services (IoT, API, Monitoring).
- **`base/`**: Shared core resources (NetworkPolicies, ResourceQuotas) applied globally to workloads.
- **`environments/`**: Kustomize overlays defining `dev` and `prod` configurations.
- **`tools/`**: Automation scripts (e.g., Backstage Catalog Generator).

## 🚀 How to Start (Deploying a New Workload)

To add or update a service in the cluster:

1. **Create Base Manifests**: Add your Kubernetes manifests (Deployment, Service, etc.) to `apps/<app-name>/`.
2. **Add to Overlay**: Add a reference to your new app in the appropriate Kustomization file (e.g., `environments/prod/iot/kustomization.yaml`).
3. **Commit & Push**:
   ```bash
   git add .
   git commit -m "feat: add <app-name>"
   git push origin main
   ```
4. **GitOps Takes Over**: Argo CD will automatically detect the change and deploy it to the cluster.

*(Note: Every push triggers a **Trivy security scan** and an automated Docker image build via GitHub Actions).*

## 🏗️ What to Start (Day-to-Day Operations)

When working in this repository, you are generally modifying the actual applications running on the platform:

- **Developing APIs**: Edit the Node.js source code inside `apps/iot-auth-api/src/`. Push to main to build and deploy.
- **Adjusting Resource Limits**: Modify the `ResourceQuotas` and `LimitRanges` in the `base/` directory.
- **Configuring Canary Deployments**: Critical services (like Node-RED) use **Argo Rollouts**. You can adjust the rollout strategy in the app's manifests:
  ```yaml
  strategy:
    canary:
      steps:
        - setWeight: 20
        - pause: { duration: 60s }
        - analysis: { templateName: success-rate }
  ```

---

## 🏗️ The IoT Stack

A production-grade messaging and telemetry pipeline:
1.  **EMQX**: High-availability MQTT broker.
2.  **Provisioning API**: Automated per-device unique identity registration.
3.  **Node-RED**: Stream processing flows (MQTT -> SQL/Parquet).
4.  **InfluxDB/Postgres**: Dual-sink telemetry storage.

---

## 🛡️ Resource Controls

All production workloads are governed by:
- **ResourceQuotas**: Hard limits per namespace.
- **LimitRanges**: Default requests/limits for every pod.
- **NetworkPolicies**: Strict "Default Deny" traffic rules.

---

## 🎨 System Architecture

![Platform Architecture](../nas-k8s-foundation/docs/assets/architecture.png)

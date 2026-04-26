# 🟢 N100 Services Runtime

This repository manages the application workloads and runtime services deployed on the **N100 Mini PC** worker node. It follows a GitOps model, synchronized via **Argo CD**.

## 🚀 Overview

The runtime layer contains:
- 🌐 **Web Applications**: Backstage, Immich, Nextcloud.
- 🏗️ **Core Services**: API, n8n (Automation).
- 🗄️ **Databases**: Postgres HA (CloudNativePG), Redis (Sentinel), RabbitMQ.
- 🔐 **Connectors**: External DB connectors and secrets.

## 📂 Repository Structure

```bash
.
├── apps/                   # Application-specific Helm charts and manifests
│   ├── api/               # Custom API service
│   ├── immich/            # Media management
│   ├── nextcloud/         # Cloud storage
│   └── ...                # Other workloads
├── environments/           # Environment-specific overrides (dev, staging, prod)
├── infra/                  # Shared runtime infrastructure (backups, etc.)
├── kustomize/              # Kustomize base and overlays for deployment
└── .github/workflows/      # Automated deployment pipelines
```

## 🔄 GitOps Workflow

1.  **Develop**: Changes are made in `apps/` or `environments/`.
2.  **Validate**: GitHub Actions run YAML linting, security scans, and Kustomize builds.
3.  **Deploy**: 
    - **PRs**: Trigger a **Preview Environment** in a dedicated namespace.
    - **Merge to `main`**: Triggers a production sync via Argo CD.

## 🛠️ Usage

### Local Validation
```bash
# Validate Kustomize build
kustomize build kustomize/overlays/prod
```

### Manual Deploy (Emergency Only)
```bash
kubectl apply -k kustomize/overlays/prod
```

## 🛡️ Security

- All images are scanned by **Trivy**.
- Secrets are managed via **External Secrets** (Bitwarden).
- Network policies enforce isolation between workloads.

## 🤝 Contributing

Follow the standard PR workflow. Ensure all linting passes before requesting a review.

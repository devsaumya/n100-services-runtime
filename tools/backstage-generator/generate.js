const fs = require("fs");
const path = require("path");

const APPS_DIR = path.resolve(__dirname, "../../apps");
const OUT = path.resolve(__dirname, "../../apps/backstage/catalog");

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

fs.readdirSync(APPS_DIR).forEach(app => {
  if (app === "backstage") return;
  const stats = fs.statSync(path.join(APPS_DIR, app));
  if (!stats.isDirectory()) return;

  const entity = `
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: ${app}
  annotations:
    backstage.io/kubernetes-id: ${app}
    argocd/app-name: ${app}
    grafana/dashboard: ${app}
spec:
  type: service
  lifecycle: production
  owner: platform
`;

  fs.writeFileSync(path.join(OUT, `${app}.yaml`), entity.trim());
});
console.log("✅ Backstage catalog generated in ${OUT}");

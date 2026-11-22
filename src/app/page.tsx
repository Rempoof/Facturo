import { db } from "@/db";
import {
  businessSettings,
  clients,
  servicesCatalog,
  projects,
  documents,
  payments,
} from "@/db/schema";
import { ensureSeededData } from "@/db/seed";
import { desc } from "drizzle-orm";
import {
  FacturoWorkspace,
  type FacturoAppState,
} from "@/components/FacturoWorkspace";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSeededData();

  const [
    settingsRows,
    clientRows,
    catalogRows,
    projectRows,
    documentRows,
    paymentRows,
  ] = await Promise.all([
    db.select().from(businessSettings),
    db.select().from(clients).orderBy(desc(clients.id)),
    db.select().from(servicesCatalog).orderBy(servicesCatalog.id),
    db.select().from(projects).orderBy(desc(projects.id)),
    db.select().from(documents).orderBy(desc(documents.id)),
    db.select().from(payments).orderBy(desc(payments.id)),
  ]);

  const initialState: FacturoAppState = {
    settings: settingsRows[0],
    clients: clientRows,
    catalog: catalogRows,
    projects: projectRows,
    documents: documentRows,
    payments: paymentRows,
  };

  return <FacturoWorkspace initialState={initialState} />;
}

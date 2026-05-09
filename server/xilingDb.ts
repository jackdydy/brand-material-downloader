import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import {
  xilingConfig,
  cardKeys,
  downloadHistory,
  cardKeyUsage,
  InsertXilingConfig,
  InsertCardKey,
  InsertDownloadHistory,
  InsertCardKeyUsage,
  XilingConfig,
  CardKey,
  DownloadHistory,
} from "../drizzle/schema";

/**
 * 小靈素材數據庫操作模組
 */

// ============ Xiling Config Operations ============

export async function getXilingConfig(email: string): Promise<XilingConfig | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(xilingConfig).where(eq(xilingConfig.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getXilingConfigById(id: number): Promise<XilingConfig | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(xilingConfig).where(eq(xilingConfig.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createXilingConfig(config: InsertXilingConfig): Promise<XilingConfig> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(xilingConfig).values(config);

  const created = await getXilingConfig(config.email);
  if (!created) throw new Error("Failed to create xiling config");

  return created;
}

export async function updateXilingConfig(
  id: number,
  updates: Partial<Omit<XilingConfig, "id" | "createdAt">>
): Promise<XilingConfig> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(xilingConfig).set(updates).where(eq(xilingConfig.id, id));

  const updated = await getXilingConfigById(id);
  if (!updated) throw new Error("Failed to update xiling config");

  return updated;
}

// ============ Card Key Operations ============

export async function getCardKeyByValue(keyValue: string): Promise<CardKey | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(cardKeys).where(eq(cardKeys.keyValue, keyValue)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getCardKeyById(id: number): Promise<CardKey | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(cardKeys).where(eq(cardKeys.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createCardKey(cardKey: InsertCardKey): Promise<CardKey> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(cardKeys).values(cardKey);

  const created = await getCardKeyByValue(cardKey.keyValue);
  if (!created) throw new Error("Failed to create card key");

  return created;
}

export async function updateCardKey(
  id: number,
  updates: Partial<Omit<CardKey, "id" | "createdAt">>
): Promise<CardKey> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(cardKeys).set(updates).where(eq(cardKeys.id, id));

  const updated = await getCardKeyById(id);
  if (!updated) throw new Error("Failed to update card key");

  return updated;
}

export async function decrementCardKeyQuota(id: number, amount: number = 1): Promise<CardKey> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cardKey = await getCardKeyById(id);
  if (!cardKey) throw new Error("Card key not found");

  const newQuota = Math.max(0, cardKey.remainingQuota - amount);

  // 如果額度用完，更新狀態為 "used"
  const newStatus = newQuota === 0 ? "used" : cardKey.status;

  return updateCardKey(id, {
    remainingQuota: newQuota,
    status: newStatus as any,
  });
}

// ============ Download History Operations ============

export async function createDownloadHistory(history: InsertDownloadHistory): Promise<DownloadHistory> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(downloadHistory).values(history);

  // 獲取剛剛插入的記錄
  const result = await db
    .select()
    .from(downloadHistory)
    .where(
      and(
        eq(downloadHistory.materialUrl, history.materialUrl),
        eq(downloadHistory.cardKeyId, history.cardKeyId)
      )
    )
    .orderBy(downloadHistory.createdAt)
    .limit(1);

  if (result.length === 0) throw new Error("Failed to create download history");

  return result[0];
}

export async function updateDownloadHistory(
  id: number,
  updates: Partial<Omit<DownloadHistory, "id" | "createdAt">>
): Promise<DownloadHistory> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(downloadHistory).set(updates).where(eq(downloadHistory.id, id));

  const updated = await db.select().from(downloadHistory).where(eq(downloadHistory.id, id)).limit(1);

  if (updated.length === 0) throw new Error("Failed to update download history");

  return updated[0];
}

export async function getDownloadHistoryById(id: number): Promise<DownloadHistory | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(downloadHistory).where(eq(downloadHistory.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Card Key Usage Operations ============

export async function createCardKeyUsage(usage: InsertCardKeyUsage): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(cardKeyUsage).values(usage);
}

export async function getCardKeyUsageStats(cardKeyId: number): Promise<{ totalUsed: number; usageCount: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      totalUsed: cardKeyUsage.quotaUsed,
    })
    .from(cardKeyUsage)
    .where(eq(cardKeyUsage.cardKeyId, cardKeyId));

  const totalUsed = result.reduce((sum, row) => sum + (row.totalUsed || 0), 0);

  return {
    totalUsed,
    usageCount: result.length,
  };
}

// ============ Validation Functions ============

/**
 * 驗證卡密是否可用
 */
export async function isCardKeyValid(keyValue: string): Promise<boolean> {
  try {
    const cardKey = await getCardKeyByValue(keyValue);

    if (!cardKey) {
      return false;
    }

    // 檢查狀態
    if (cardKey.status !== "active") {
      return false;
    }

    // 檢查額度
    if (cardKey.remainingQuota <= 0) {
      return false;
    }

    // 檢查有效期
    if (cardKey.expiresAt && cardKey.expiresAt !== -1 && cardKey.expiresAt < Date.now()) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating card key:", error);
    return false;
  }
}

/**
 * 獲取卡密詳細信息（用於前台展示）
 */
export async function getCardKeyInfo(keyValue: string): Promise<{
  valid: boolean;
  remainingQuota?: number;
  type?: string;
  expiresAt?: number;
  message?: string;
} | null> {
  try {
    const cardKey = await getCardKeyByValue(keyValue);

    if (!cardKey) {
      return {
        valid: false,
        message: "卡密不存在",
      };
    }

    if (cardKey.status !== "active") {
      return {
        valid: false,
        message: `卡密已${cardKey.status === "used" ? "用完" : "過期"}`,
      };
    }

    if (cardKey.remainingQuota <= 0) {
      return {
        valid: false,
        message: "卡密額度已用完",
      };
    }

    if (cardKey.expiresAt && cardKey.expiresAt !== -1 && cardKey.expiresAt < Date.now()) {
      return {
        valid: false,
        message: "卡密已過期",
      };
    }

    return {
      valid: true,
      remainingQuota: cardKey.remainingQuota,
      type: cardKey.type,
      expiresAt: cardKey.expiresAt || undefined,
    };
  } catch (error) {
    console.error("Error getting card key info:", error);
    return null;
  }
}

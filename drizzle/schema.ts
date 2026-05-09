import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 小靈素材帳號配置表
 * 存儲用於自動登入的帳號信息
 */
export const xilingConfig = mysqlTable("xiling_config", {
  id: int("id").autoincrement().primaryKey(),
  /** 小靈素材郵箱 */
  email: varchar("email", { length: 255 }).notNull().unique(),
  /** 小靈素材密碼（加密存儲） */
  passwordEncrypted: text("password_encrypted").notNull(),
  /** 帳號狀態 */
  status: mysqlEnum("status", ["active", "inactive", "error"]).default("active").notNull(),
  /** 最後驗證時間 */
  lastVerifiedAt: timestamp("last_verified_at"),
  /** 驗證錯誤信息 */
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type XilingConfig = typeof xilingConfig.$inferSelect;
export type InsertXilingConfig = typeof xilingConfig.$inferInsert;

/**
 * 卡密表
 * 存儲小靈素材卡密信息
 */
export const cardKeys = mysqlTable("card_keys", {
  id: int("id").autoincrement().primaryKey(),
  /** 卡密值 */
  keyValue: varchar("key_value", { length: 255 }).notNull().unique(),
  /** 卡密類型：按次數或按月 */
  type: mysqlEnum("type", ["per_download", "monthly"]).notNull(),
  /** 總額度（對於按月卡密，表示每月額度） */
  totalQuota: int("total_quota").notNull(),
  /** 剩餘額度 */
  remainingQuota: int("remaining_quota").notNull(),
  /** 有效期（Unix 時間戳，-1 表示永久） */
  expiresAt: bigint("expires_at", { mode: "number" }),
  /** 卡密狀態 */
  status: mysqlEnum("status", ["active", "used", "expired", "invalid"]).default("active").notNull(),
  /** 關聯的小靈配置 ID */
  xilingConfigId: int("xiling_config_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CardKey = typeof cardKeys.$inferSelect;
export type InsertCardKey = typeof cardKeys.$inferInsert;

/**
 * 下載歷史表
 * 記錄每次下載請求
 */
export const downloadHistory = mysqlTable("download_history", {
  id: int("id").autoincrement().primaryKey(),
  /** 素材連結 */
  materialUrl: text("material_url").notNull(),
  /** 使用的卡密 ID */
  cardKeyId: int("card_key_id").notNull(),
  /** 下載狀態 */
  status: mysqlEnum("status", ["pending", "success", "failed"]).default("pending").notNull(),
  /** 百度網盤下載連結 */
  downloadLink: text("download_link"),
  /** 錯誤信息 */
  errorMessage: text("error_message"),
  /** 處理耗時（毫秒） */
  processingTime: int("processing_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type DownloadHistory = typeof downloadHistory.$inferSelect;
export type InsertDownloadHistory = typeof downloadHistory.$inferInsert;

/**
 * 卡密使用記錄表
 * 記錄卡密的每次使用
 */
export const cardKeyUsage = mysqlTable("card_key_usage", {
  id: int("id").autoincrement().primaryKey(),
  /** 卡密 ID */
  cardKeyId: int("card_key_id").notNull(),
  /** 下載歷史 ID */
  downloadHistoryId: int("download_history_id").notNull(),
  /** 消耗的額度 */
  quotaUsed: int("quota_used").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CardKeyUsage = typeof cardKeyUsage.$inferSelect;
export type InsertCardKeyUsage = typeof cardKeyUsage.$inferInsert;
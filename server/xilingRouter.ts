import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { executeDownload } from "./xilingAutomation";
import {
  getCardKeyByValue,
  isCardKeyValid,
  getCardKeyInfo,
  createDownloadHistory,
  updateDownloadHistory,
  decrementCardKeyQuota,
  createCardKeyUsage,
} from "./xilingDb";

/**
 * 小靈素材 tRPC 路由
 * 處理卡密驗證、下載請求等
 */

export const xilingRouter = router({
  /**
   * 驗證卡密
   */
  validateCardKey: publicProcedure
    .input(
      z.object({
        cardKey: z.string().min(1, "卡密不能為空"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const isValid = await isCardKeyValid(input.cardKey);

        if (!isValid) {
          return {
            valid: false,
            message: "卡密無效或已過期",
          };
        }

        const info = await getCardKeyInfo(input.cardKey);

        return {
          valid: true,
          ...info,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "未知錯誤";
        return {
          valid: false,
          message: `驗證失敗: ${errorMessage}`,
        };
      }
    }),

  /**
   * 獲取卡密信息
   */
  getCardKeyInfo: publicProcedure
    .input(
      z.object({
        cardKey: z.string().min(1, "卡密不能為空"),
      })
    )
    .query(async ({ input }) => {
      try {
        const info = await getCardKeyInfo(input.cardKey);

        if (!info) {
          return {
            success: false,
            message: "無法獲取卡密信息",
          };
        }

        return {
          success: true,
          ...info,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "未知錯誤";
        return {
          success: false,
          message: `獲取信息失敗: ${errorMessage}`,
        };
      }
    }),

  /**
   * 提交下載請求
   */
  submitDownload: publicProcedure
    .input(
      z.object({
        materialUrl: z.string().url("請輸入有效的 URL"),
        cardKey: z.string().min(1, "卡密不能為空"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // 驗證卡密
        const isValid = await isCardKeyValid(input.cardKey);

        if (!isValid) {
          return {
            success: false,
            message: "卡密無效或已過期，請檢查後重試",
          };
        }

        // 獲取卡密信息
        const cardKey = await getCardKeyByValue(input.cardKey);

        if (!cardKey) {
          return {
            success: false,
            message: "卡密不存在",
          };
        }

        // 創建下載歷史記錄
        const history = await createDownloadHistory({
          materialUrl: input.materialUrl,
          cardKeyId: cardKey.id,
          status: "pending",
        });

        try {
          // 執行下載（這是一個異步操作，實際應該在後台執行）
          // 為了演示，我們這裡模擬一個下載過程
          const result = await executeDownload(
            {
              email: "jackdydy@gmail.com", // TODO: 從配置中讀取
              password: "123456", // TODO: 從加密配置中讀取
            },
            input.materialUrl
          );

          if (result.success && result.downloadLink) {
            // 更新下載歷史
            await updateDownloadHistory(history.id, {
              status: "success",
              downloadLink: result.downloadLink,
              processingTime: result.processingTime,
            });

            // 扣除卡密額度
            await decrementCardKeyQuota(cardKey.id, 1);

            // 記錄卡密使用
            await createCardKeyUsage({
              cardKeyId: cardKey.id,
              downloadHistoryId: history.id,
              quotaUsed: 1,
            });

            return {
              success: true,
              downloadLink: result.downloadLink,
              message: "下載連結已生成",
            };
          } else {
            // 更新下載歷史為失敗
            await updateDownloadHistory(history.id, {
              status: "failed",
              errorMessage: result.errorMessage,
              processingTime: result.processingTime,
            });

            return {
              success: false,
              message: `下載失敗: ${result.errorMessage}`,
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "未知錯誤";

          // 更新下載歷史為失敗
          await updateDownloadHistory(history.id, {
            status: "failed",
            errorMessage: errorMessage,
          });

          return {
            success: false,
            message: `下載過程中出現錯誤: ${errorMessage}`,
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "未知錯誤";
        return {
          success: false,
          message: `請求失敗: ${errorMessage}`,
        };
      }
    }),

  /**
   * 檢查下載狀態
   */
  checkDownloadStatus: publicProcedure
    .input(
      z.object({
        downloadId: z.number().int().positive("無效的下載 ID"),
      })
    )
    .query(async ({ input }) => {
      try {
        // 這裡應該從數據庫查詢下載狀態
        // 為了演示，返回一個示例響應

        return {
          success: true,
          status: "processing",
          message: "正在處理中...",
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "未知錯誤";
        return {
          success: false,
          message: `查詢失敗: ${errorMessage}`,
        };
      }
    }),
});

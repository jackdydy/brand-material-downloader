import { chromium, Browser, Page } from "playwright";

/**
 * 小靈素材自動化模組
 * 使用 Playwright 模擬瀏覽器操作，完成登入和下載任務
 */

interface AutomationResult {
  success: boolean;
  downloadLink?: string;
  errorMessage?: string;
  processingTime?: number;
}

interface LoginCredentials {
  email: string;
  password: string;
}

class XilingAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly baseUrl = "https://sucai.ixling.com";
  private readonly loginUrl = `${this.baseUrl}/login`;
  private readonly downloadPageUrl = `${this.baseUrl}/`;

  /**
   * 初始化瀏覽器
   */
  async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }
  }

  /**
   * 關閉瀏覽器
   */
  async closeBrowser(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * 登入小靈素材
   */
  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      await this.initBrowser();

      if (!this.browser) {
        throw new Error("Failed to initialize browser");
      }

      this.page = await this.browser.newPage();

      // 導航到登入頁面
      await this.page.goto(this.loginUrl, { waitUntil: "networkidle" });

      // 等待登入表單加載
      await this.page.waitForSelector('input[type="username"]', { timeout: 10000 });

      // 填入郵箱
      await this.page.fill('input[type="username"]', credentials.email);

      // 填入密碼
      await this.page.fill('input[type="password"]', credentials.password);

      // 點擊登入按鈕
      const loginButton = await this.page.$('button:has-text("郵箱登录")');
      if (loginButton) {
        await loginButton.click();
      } else {
        throw new Error("Login button not found");
      }

      // 等待登入完成（檢查頁面是否重定向）
      await this.page.waitForNavigation({ waitUntil: "networkidle", timeout: 15000 }).catch(() => {
        // 有時候不會觸發 navigation 事件，所以忽略超時
      });

      // 驗證登入是否成功
      const isLoggedIn = await this.checkLoginStatus();

      if (!isLoggedIn) {
        throw new Error("Login failed: Unable to verify login status");
      }

      console.log("[Xiling] Login successful");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[Xiling] Login failed:", errorMessage);
      throw new Error(`Login failed: ${errorMessage}`);
    }
  }

  /**
   * 檢查登入狀態
   */
  private async checkLoginStatus(): Promise<boolean> {
    if (!this.page) {
      return false;
    }

    try {
      // 嘗試檢查是否存在登出按鈕或用戶信息
      const userMenu = await this.page.$(".user-menu, [class*='user'], [class*='profile']");
      return !!userMenu;
    } catch {
      return false;
    }
  }

  /**
   * 提交素材連結並獲取下載連結
   */
  async downloadMaterial(materialUrl: string): Promise<AutomationResult> {
    const startTime = Date.now();

    try {
      if (!this.page) {
        throw new Error("Page not initialized. Please login first.");
      }

      // 導航到下載頁面
      await this.page.goto(this.downloadPageUrl, { waitUntil: "networkidle" });

      // 等待輸入框出現
      await this.page.waitForSelector('input[placeholder*="資源"]', { timeout: 10000 });

      // 填入素材連結
      const inputField = await this.page.$('input[placeholder*="資源"]');
      if (!inputField) {
        throw new Error("Input field not found");
      }

      await inputField.fill(materialUrl);

      // 點擊下載按鈕
      const downloadButton = await this.page.$('button:has-text("下載")');
      if (!downloadButton) {
        throw new Error("Download button not found");
      }

      await downloadButton.click();

      // 等待結果頁面加載
      await this.page.waitForTimeout(3000); // 等待頁面處理

      // 嘗試提取下載連結
      const downloadLink = await this.extractDownloadLink();

      if (!downloadLink) {
        throw new Error("Failed to extract download link from page");
      }

      const processingTime = Date.now() - startTime;

      console.log("[Xiling] Download successful:", downloadLink);

      return {
        success: true,
        downloadLink,
        processingTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const processingTime = Date.now() - startTime;

      console.error("[Xiling] Download failed:", errorMessage);

      return {
        success: false,
        errorMessage,
        processingTime,
      };
    }
  }

  /**
   * 從頁面提取下載連結
   * 這個方法需要根據小靈素材的實際 HTML 結構調整
   */
  private async extractDownloadLink(): Promise<string | null> {
    if (!this.page) {
      return null;
    }

    try {
      // 嘗試多種方式提取下載連結
      // 方法 1: 查找 href 包含 "pan.baidu.com" 的連結
      const baiduLink = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("a"));
        const baiduLink = links.find((link) => link.href.includes("pan.baidu.com"));
        return baiduLink?.href || null;
      });

      if (baiduLink) {
        return baiduLink;
      }

      // 方法 2: 查找特定的結果容器
      const resultLink = await this.page.evaluate(() => {
        const resultContainer = document.querySelector("[class*='result'], [class*='download'], [class*='link']");
        if (resultContainer) {
          const link = resultContainer.querySelector("a");
          return link?.href || null;
        }
        return null;
      });

      if (resultLink) {
        return resultLink;
      }

      // 方法 3: 查找頁面中的所有連結並過濾
      const allLinks = await this.page.evaluate(() => {
        return Array.from(document.querySelectorAll("a"))
          .map((a) => a.href)
          .filter((href) => href && (href.includes("pan.baidu.com") || href.includes("ixling")));
      });

      return allLinks.length > 0 ? allLinks[0] : null;
    } catch (error) {
      console.error("[Xiling] Error extracting download link:", error);
      return null;
    }
  }

  /**
   * 驗證卡密是否有效
   */
  async verifyCardKey(cardKey: string): Promise<boolean> {
    try {
      if (!this.page) {
        throw new Error("Page not initialized. Please login first.");
      }

      // 導航到帳號頁面或卡密管理頁面
      await this.page.goto(`${this.baseUrl}/account`, { waitUntil: "networkidle" }).catch(() => {
        // 如果帳號頁面不存在，嘗試其他頁面
      });

      // 等待頁面加載
      await this.page.waitForTimeout(2000);

      // 檢查卡密是否在頁面上顯示
      const cardKeyElement = await this.page.$(`text="${cardKey}"`);

      return !!cardKeyElement;
    } catch (error) {
      console.error("[Xiling] Error verifying card key:", error);
      return false;
    }
  }
}

export const xilingAutomation = new XilingAutomation();

/**
 * 執行完整的下載流程
 */
export async function executeDownload(
  credentials: LoginCredentials,
  materialUrl: string
): Promise<AutomationResult> {
  try {
    // 登入
    await xilingAutomation.login(credentials);

    // 下載
    const result = await xilingAutomation.downloadMaterial(materialUrl);

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      errorMessage,
    };
  } finally {
    // 關閉瀏覽器
    await xilingAutomation.closeBrowser();
  }
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Download, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * Design Philosophy: Modern Material Download Platform
 * - Clean, professional interface focused on core functionality
 * - Green accent color (primary brand) with modern gradients
 * - Smooth transitions and micro-interactions
 * - Mobile-first responsive design
 */

interface DownloadResult {
  status: "success" | "error" | "pending";
  link?: string;
  message?: string;
  fileName?: string;
}

export default function Home() {
  const [materialUrl, setMaterialUrl] = useState("");
  const [cardKey, setCardKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null);
  const [showCardInput, setShowCardInput] = useState(false);

  // tRPC mutations
  const validateCardKeyMutation = trpc.xiling.validateCardKey.useMutation();
  const submitDownloadMutation = trpc.xiling.submitDownload.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!materialUrl.trim()) {
      toast.error("請輸入素材連結");
      return;
    }

    if (!cardKey.trim()) {
      toast.error("請輸入卡密");
      return;
    }

    setIsLoading(true);
    setDownloadResult({ status: "pending", message: "正在驗證卡密..." });

    try {
      // 先驗證卡密
      const validation = await validateCardKeyMutation.mutateAsync({
        cardKey: cardKey.trim(),
      });

      if (!validation.valid) {
        setDownloadResult({
          status: "error",
          message: validation.message || "卡密驗證失敗",
        });
        toast.error("卡密驗證失敗");
        setIsLoading(false);
        return;
      }

      // 卡密有效，開始下載
      setDownloadResult({ status: "pending", message: "正在處理您的請求..." });

      const result = await submitDownloadMutation.mutateAsync({
        materialUrl: materialUrl.trim(),
        cardKey: cardKey.trim(),
      });

      if (result.success && result.downloadLink) {
        setDownloadResult({
          status: "success",
          link: result.downloadLink,
          fileName: "素材文件.zip",
          message: result.message || "下載連結已生成，請在 24 小時內下載",
        });
        toast.success("下載連結已生成！");
      } else {
        setDownloadResult({
          status: "error",
          message: result.message || "處理失敗，請檢查連結和卡密是否正確",
        });
        toast.error("處理失敗");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知錯誤";
      setDownloadResult({
        status: "error",
        message: `處理失敗: ${errorMessage}`,
      });
      toast.error("處理失敗，請重試");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已複製到剪貼板");
  };

  const handleReset = () => {
    setMaterialUrl("");
    setCardKey("");
    setDownloadResult(null);
    setShowCardInput(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Placeholder - Easy to customize */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">素</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">素材代下平台</h1>
              <p className="text-xs text-slate-500">快速獲取您需要的素材</p>
            </div>
          </div>

          {/* Navigation Links - Placeholder for future expansion */}
          <nav className="hidden md:flex gap-6">
            <a href="#" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">
              首頁
            </a>
            <a href="#" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">
              購買卡密
            </a>
            <a href="#" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">
              教程
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              素材一鍵下載
            </h2>
            <p className="text-lg text-slate-600 mb-2">
              支持 Envato Elements、Freepik、Magnific 等多個平台
            </p>
            <p className="text-sm text-slate-500">
              只需粘貼素材連結，即可快速獲得百度網盤下載連結
            </p>
          </div>

          {/* Main Form Card */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Material URL Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    素材連結
                  </label>
                  <Input
                    type="url"
                    placeholder="粘貼素材連結 (例如: https://elements.envato.com/...)"
                    value={materialUrl}
                    onChange={(e) => setMaterialUrl(e.target.value)}
                    disabled={isLoading}
                    className="h-12 text-base border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    支持的平台：Envato Elements、Freepik、Magnific、Flaxicon 等
                  </p>
                </div>

                {/* Card Key Input - Toggle */}
                {!showCardInput ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-slate-300 text-slate-700 hover:bg-slate-50"
                    onClick={() => setShowCardInput(true)}
                  >
                    + 輸入卡密
                  </Button>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      卡密
                    </label>
                    <Input
                      type="password"
                      placeholder="輸入您的卡密"
                      value={cardKey}
                      onChange={(e) => setCardKey(e.target.value)}
                      disabled={isLoading}
                      className="h-12 text-base border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      沒有卡密？<a href="#" className="text-emerald-600 hover:underline">立即購買</a>
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !materialUrl.trim()}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      處理中...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      生成下載連結
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>

          {/* Download Result Section */}
          {downloadResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {downloadResult.status === "success" && (
                <Card className="border-emerald-200 bg-emerald-50 border-2">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-emerald-900 mb-2">
                          下載連結已生成
                        </h3>
                        <p className="text-sm text-emerald-800 mb-4">
                          {downloadResult.message}
                        </p>

                        {/* Download Link Card */}
                        <div className="bg-white rounded-lg p-4 mb-4 border border-emerald-200">
                          <p className="text-xs text-slate-500 mb-2">百度網盤下載連結</p>
                          <div className="flex items-center justify-between gap-2">
                            <code className="text-sm text-slate-700 break-all font-mono">
                              {downloadResult.link}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(downloadResult.link || "")}
                              className="flex-shrink-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={handleReset}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            下載新素材
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(downloadResult.link || "")}
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          >
                            複製連結
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {downloadResult.status === "error" && (
                <Card className="border-red-200 bg-red-50 border-2">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 mb-2">
                          處理失敗
                        </h3>
                        <p className="text-sm text-red-800 mb-4">
                          {downloadResult.message}
                        </p>
                        <Button
                          onClick={handleReset}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          重試
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {downloadResult.status === "pending" && (
                <Card className="border-blue-200 bg-blue-50 border-2">
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-900 font-medium">
                          {downloadResult.message}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          這通常需要幾秒到幾分鐘，請耐心等待...
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-12">
            <Card className="border-slate-200 bg-white hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">快速處理</h3>
                <p className="text-sm text-slate-600">
                  大多數素材在幾秒內完成處理
                </p>
              </div>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">安全可靠</h3>
                <p className="text-sm text-slate-600">
                  所有連結直接來自官方平台
                </p>
              </div>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">價格優惠</h3>
                <p className="text-sm text-slate-600">
                  相比原平台便宜 30-50%
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">關於我們</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">平台介紹</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">聯繫我們</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">幫助</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">使用教程</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">常見問題</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">購買</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">購買卡密</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">批量購買</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">其他</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">服務條款</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">隱私政策</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-slate-600">
              © 2026 素材代下平台. 保留所有權利。
            </p>
            <p className="text-xs text-slate-500 mt-4 md:mt-0">
              本平台僅為素材代下服務，不涉及任何版權問題
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

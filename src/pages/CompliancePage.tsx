import React, { useState } from 'react';
import Header from "../components/Layout/Header";
import BackButton from "../components/common/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useTranslation } from "../contexts/TranslationContext";
import { useToast } from "../hooks/use-toast";
import { 
  Shield, 
  FileText, 
  Upload, 
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Building,
  CreditCard,
  AlertTriangle
} from "lucide-react";

const CompliancePage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [kycLevel, setKycLevel] = useState(2);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      // 模拟文件上传
      setTimeout(() => {
        setUploading(false);
        toast({
          title: "文件上传成功",
          description: `${file.name} 已成功上传，等待审核`,
        });
      }, 2000);
    }
  };

  const handleComplianceCheck = () => {
    toast({
      title: "合规检查已启动",
      description: "正在进行 KYC/AML 合规性检查...",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto py-8 space-y-8">
        <BackButton />
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            合规中心
          </h1>
          <p className="text-lg text-muted-foreground">
            KYC/AML 合规性检查与认证管理
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Compliance Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* KYC Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  KYC 认证状态
                </CardTitle>
                <CardDescription>
                  当前认证级别和状态信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-medium">KYC Level {kycLevel}</p>
                      <p className="text-sm text-muted-foreground">身份认证已完成</p>
                    </div>
                  </div>
                  <Badge variant="default">已认证</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">身份验证</span>
                    </div>
                    <p className="text-xs text-muted-foreground">护照/身份证已验证</p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">地址验证</span>
                    </div>
                    <p className="text-xs text-muted-foreground">居住地址已确认</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  文档上传
                </CardTitle>
                <CardDescription>
                  上传额外的认证文档以提高 KYC 等级
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>营业执照</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="business-license"
                        accept=".pdf,.jpg,.png"
                      />
                      <label htmlFor="business-license" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">点击上传文件</p>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>银行证明</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="bank-statement"
                        accept=".pdf,.jpg,.png"
                      />
                      <label htmlFor="bank-statement" className="cursor-pointer">
                        <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">银行对账单</p>
                      </label>
                    </div>
                  </div>
                </div>

                {uploading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span className="text-sm">正在上传文档...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AML Check */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  AML 反洗钱检查
                </CardTitle>
                <CardDescription>
                  自动化反洗钱和制裁名单检查
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">AML 检查通过</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>✅ OFAC 制裁名单检查: 未发现</p>
                    <p>✅ EU 制裁名单检查: 未发现</p>
                    <p>✅ 俄罗斯制裁检查: 未发现</p>
                    <p>✅ 资金来源验证: 通过</p>
                  </div>
                </div>

                <Button onClick={handleComplianceCheck} className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  重新进行合规检查
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compliance Score */}
            <Card>
              <CardHeader>
                <CardTitle>合规评分</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">92/100</div>
                  <p className="text-sm text-muted-foreground">优秀</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>身份验证</span>
                    <span>25/25</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>地址验证</span>
                    <span>20/25</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>资金来源</span>
                    <span>22/25</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>AML 检查</span>
                    <span>25/25</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  风险评估
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">低风险用户</span>
                </div>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• 交易记录良好</p>
                  <p>• 身份信息完整</p>
                  <p>• 无异常行为记录</p>
                  <p>• 符合俄罗斯法规要求</p>
                </div>
              </CardContent>
            </Card>

            {/* Compliance History */}
            <Card>
              <CardHeader>
                <CardTitle>合规历史</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">KYC-2 升级</p>
                    <p className="text-xs text-muted-foreground">2024-01-15</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">地址验证完成</p>
                    <p className="text-xs text-muted-foreground">2024-01-10</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">身份认证完成</p>
                    <p className="text-xs text-muted-foreground">2024-01-05</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompliancePage;
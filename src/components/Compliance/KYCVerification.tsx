import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Upload, FileText, User, Shield, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KYCStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

const KYCVerification = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [kycStatus, setKycStatus] = useState<'pending' | 'in_review' | 'approved' | 'rejected'>('pending');
  
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      phoneNumber: '',
      address: ''
    },
    documents: {
      idDocument: null as File | null,
      proofOfAddress: null as File | null,
      selfie: null as File | null
    },
    businessInfo: {
      companyName: '',
      businessType: '',
      registrationNumber: '',
      businessAddress: ''
    }
  });

  const kycSteps: KYCStep[] = [
    {
      id: 'personal',
      title: '个人信息',
      description: '提供基本的个人身份信息',
      completed: false,
      required: true
    },
    {
      id: 'documents',
      title: '身份验证文件',
      description: '上传身份证明和地址证明',
      completed: false,
      required: true
    },
    {
      id: 'business',
      title: '商业信息',
      description: '提供商业实体信息（如适用）',
      completed: false,
      required: false
    },
    {
      id: 'review',
      title: '审核确认',
      description: '审核提交的信息并等待批准',
      completed: false,
      required: true
    }
  ];

  const completedSteps = kycSteps.filter(step => step.completed).length;
  const progress = (completedSteps / kycSteps.length) * 100;

  const handleFileUpload = (type: keyof typeof formData.documents, file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [type]: file
      }
    }));
    toast({
      title: "文件上传成功",
      description: `${file.name} 已成功上传`
    });
  };

  const handleSubmitStep = () => {
    // 模拟步骤提交
    const newSteps = [...kycSteps];
    newSteps[currentStep].completed = true;
    
    if (currentStep < kycSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setKycStatus('in_review');
      toast({
        title: "KYC申请已提交",
        description: "您的申请正在审核中，通常需要1-3个工作日"
      });
    }
  };

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">名字 *</Label>
          <Input
            id="firstName"
            value={formData.personalInfo.firstName}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, firstName: e.target.value }
            }))}
            placeholder="请输入您的名字"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">姓氏 *</Label>
          <Input
            id="lastName"
            value={formData.personalInfo.lastName}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, lastName: e.target.value }
            }))}
            placeholder="请输入您的姓氏"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">出生日期 *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.personalInfo.dateOfBirth}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value }
            }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nationality">国籍 *</Label>
          <Select
            value={formData.personalInfo.nationality}
            onValueChange={(value) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, nationality: value }
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择国籍" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CN">中国</SelectItem>
              <SelectItem value="RU">俄罗斯</SelectItem>
              <SelectItem value="US">美国</SelectItem>
              <SelectItem value="OTHER">其他</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">电话号码 *</Label>
        <Input
          id="phoneNumber"
          value={formData.personalInfo.phoneNumber}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, phoneNumber: e.target.value }
          }))}
          placeholder="+86 138 0000 0000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">居住地址 *</Label>
        <Textarea
          id="address"
          value={formData.personalInfo.address}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, address: e.target.value }
          }))}
          placeholder="请输入您的完整居住地址"
          rows={3}
        />
      </div>
    </div>
  );

  const renderDocumentsStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-primary mb-2" />
            <h3 className="font-medium">身份证明文件</h3>
            <p className="text-sm text-muted-foreground">身份证、护照或驾驶证</p>
          </div>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <Button variant="outline" size="sm" className="mb-2">
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('idDocument', file);
                }}
              />
              选择文件
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG 或 PDF, 最大 5MB</p>
            {formData.documents.idDocument && (
              <Badge variant="outline" className="mt-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                已上传
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-primary mb-2" />
            <h3 className="font-medium">地址证明文件</h3>
            <p className="text-sm text-muted-foreground">银行账单或水电费账单</p>
          </div>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <Button variant="outline" size="sm" className="mb-2">
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('proofOfAddress', file);
                }}
              />
              选择文件
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG 或 PDF, 最大 5MB</p>
            {formData.documents.proofOfAddress && (
              <Badge variant="outline" className="mt-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                已上传
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto text-primary mb-2" />
            <h3 className="font-medium">自拍照片</h3>
            <p className="text-sm text-muted-foreground">手持身份证明的自拍</p>
          </div>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <Button variant="outline" size="sm" className="mb-2">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('selfie', file);
                }}
              />
              选择文件
            </Button>
            <p className="text-xs text-muted-foreground">JPG 或 PNG, 最大 5MB</p>
            {formData.documents.selfie && (
              <Badge variant="outline" className="mt-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                已上传
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">公司名称</Label>
          <Input
            id="companyName"
            value={formData.businessInfo.companyName}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              businessInfo: { ...prev.businessInfo, companyName: e.target.value }
            }))}
            placeholder="请输入公司名称"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessType">业务类型</Label>
          <Select
            value={formData.businessInfo.businessType}
            onValueChange={(value) => setFormData(prev => ({
              ...prev,
              businessInfo: { ...prev.businessInfo, businessType: value }
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择业务类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trading">贸易</SelectItem>
              <SelectItem value="tech">科技</SelectItem>
              <SelectItem value="finance">金融</SelectItem>
              <SelectItem value="retail">零售</SelectItem>
              <SelectItem value="other">其他</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="registrationNumber">工商注册号</Label>
        <Input
          id="registrationNumber"
          value={formData.businessInfo.registrationNumber}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            businessInfo: { ...prev.businessInfo, registrationNumber: e.target.value }
          }))}
          placeholder="请输入工商注册号"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessAddress">公司地址</Label>
        <Textarea
          id="businessAddress"
          value={formData.businessInfo.businessAddress}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            businessInfo: { ...prev.businessInfo, businessAddress: e.target.value }
          }))}
          placeholder="请输入公司完整地址"
          rows={3}
        />
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-16 w-16 mx-auto text-primary mb-4" />
        <h3 className="text-xl font-semibold mb-2">信息审核</h3>
        <p className="text-muted-foreground">
          请确认所有信息准确无误，提交后将进入审核流程
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium mb-2">个人信息</h4>
          <div className="text-sm space-y-1">
            <p>姓名: {formData.personalInfo.firstName} {formData.personalInfo.lastName}</p>
            <p>出生日期: {formData.personalInfo.dateOfBirth}</p>
            <p>国籍: {formData.personalInfo.nationality}</p>
            <p>电话: {formData.personalInfo.phoneNumber}</p>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium mb-2">上传文件</h4>
          <div className="text-sm space-y-1">
            <p>身份证明: {formData.documents.idDocument ? '✓ 已上传' : '❌ 未上传'}</p>
            <p>地址证明: {formData.documents.proofOfAddress ? '✓ 已上传' : '❌ 未上传'}</p>
            <p>自拍照片: {formData.documents.selfie ? '✓ 已上传' : '❌ 未上传'}</p>
          </div>
        </div>

        {formData.businessInfo.companyName && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-2">商业信息</h4>
            <div className="text-sm space-y-1">
              <p>公司名称: {formData.businessInfo.companyName}</p>
              <p>业务类型: {formData.businessInfo.businessType}</p>
              <p>注册号: {formData.businessInfo.registrationNumber}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />待提交</Badge>;
      case 'in_review':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />审核中</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-success"><CheckCircle className="h-3 w-3 mr-1" />已通过</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />已拒绝</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">KYC身份验证</CardTitle>
              <CardDescription>
                完成身份验证以解锁完整的交易功能
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>完成进度</span>
              <span>{completedSteps}/{kycSteps.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent>
          {/* Steps Navigation */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {kycSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${index < kycSteps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? 'bg-primary text-primary-foreground'
                          : index === currentStep
                          ? 'bg-primary/20 text-primary border-2 border-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className="ml-2 hidden md:block">
                      <div className="text-sm font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                  
                  {index < kycSteps.length - 1 && (
                    <div className="flex-1 h-px bg-muted mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Step Content */}
          <div className="mb-8">
            {currentStep === 0 && renderPersonalInfoStep()}
            {currentStep === 1 && renderDocumentsStep()}
            {currentStep === 2 && renderBusinessInfoStep()}
            {currentStep === 3 && renderReviewStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              上一步
            </Button>

            {currentStep < kycSteps.length - 1 ? (
              <Button onClick={handleSubmitStep}>
                下一步
              </Button>
            ) : (
              <Button onClick={handleSubmitStep} disabled={kycStatus !== 'pending'}>
                提交审核
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCVerification;
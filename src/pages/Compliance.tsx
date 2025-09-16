import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import KYCVerification from "../components/Compliance/KYCVerification";
import AMLAssessment from "../components/Compliance/AMLAssessment";
import Header from "../components/Layout/Header";

const CompliancePage = () => {
  const [activeTab, setActiveTab] = useState("kyc");

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">合规中心</h1>
          <p className="text-muted-foreground">
            完成身份验证和风险评估，确保交易安全合规
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kyc">KYC身份验证</TabsTrigger>
            <TabsTrigger value="aml">AML风险评估</TabsTrigger>
          </TabsList>
          
          <TabsContent value="kyc">
            <KYCVerification />
          </TabsContent>
          
          <TabsContent value="aml">
            <AMLAssessment />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CompliancePage;
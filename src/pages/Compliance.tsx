import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import KYCVerification from "../components/Compliance/KYCVerification";
import AMLAssessment from "../components/Compliance/AMLAssessment";
import SiteNavigation from "../components/Layout/SiteNavigation";

const CompliancePage = () => {
  const [activeTab, setActiveTab] = useState("kyc");

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SiteNavigation />
      
      <main className="container mx-auto py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kyc">KYC 验证</TabsTrigger>
            <TabsTrigger value="aml">AML 评估</TabsTrigger>
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
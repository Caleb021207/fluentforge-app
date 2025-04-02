
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";

const LanguageFrameworks = () => {
  const { t, currentLanguage } = useLocalization();
  
  // Function to determine if we should show Mandarin translations
  const isMandarin = currentLanguage === "mandarin";
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">
        {t("languageReferenceFrameworks")}
        {isMandarin && <div className="text-lg font-normal text-gray-600">语言参考框架</div>}
      </h1>
      
      <p className="text-gray-600 mb-8">
        {t("understandLevelsFrameworks")}
        {isMandarin && <div className="text-gray-500">了解评估语言熟练程度的不同级别和框架</div>}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card className="p-6 shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-4">
            {t("commonEuropeanFramework")}
            {isMandarin && <div className="text-base font-normal text-gray-600">欧洲共同语言参考框架（CEFR）</div>}
          </h2>
          <p className="text-gray-600 mb-4">
            {t("cefrDescription")}
            {isMandarin && <div className="text-gray-500">欧洲共同语言参考框架（CEFR）是描述语言能力的国际标准。它定义了从A1（初级）到C2（精通）的熟练程度级别。</div>}
          </p>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 p-3 rounded-md">
              <h3 className="font-medium text-blue-700">A1-A2</h3>
              <p className="text-sm text-gray-600">
                {t("elementary")}
                {isMandarin && <span className="block text-gray-500">初级</span>}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-md">
              <h3 className="font-medium text-blue-700">B1-B2</h3>
              <p className="text-sm text-gray-600">
                {t("intermediate")}/{t("upperIntermediate")}
                {isMandarin && <span className="block text-gray-500">中级/中高级</span>}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-md">
              <h3 className="font-medium text-blue-700">C1-C2</h3>
              <p className="text-sm text-gray-600">
                {t("advanced")}/{t("proficiency")}
                {isMandarin && <span className="block text-gray-500">高级/精通</span>}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-4">
            {t("americanCouncil")}
            {isMandarin && <div className="text-base font-normal text-gray-600">美国外语教学委员会（ACTFL）</div>}
          </h2>
          <p className="text-gray-600 mb-4">
            {t("actflDescription")}
            {isMandarin && <div className="text-gray-500">ACTFL熟练程度指南描述了个人在自发和未准备情况下在口语、写作、听力和阅读方面的能力。</div>}
          </p>
          
          <div className="space-y-2">
            <div className="bg-green-50 p-3 rounded-md">
              <h3 className="font-medium text-green-700">
                {t("noviceLow")} - {t("noviceHigh")}
                {isMandarin && <span className="block text-sm text-green-600">初学者（低级-高级）</span>}
              </h3>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <h3 className="font-medium text-green-700">
                {t("intermediateLow")} - {t("intermediateHigh")}
                {isMandarin && <span className="block text-sm text-green-600">中级（低级-高级）</span>}
              </h3>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <h3 className="font-medium text-green-700">
                {t("advancedLow")} - {t("advancedHigh")}
                {isMandarin && <span className="block text-sm text-green-600">高级（低级-高级）</span>}
              </h3>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <h3 className="font-medium text-green-700">
                {t("superior")} / {t("distinguished")}
                {isMandarin && <span className="block text-sm text-green-600">优秀 / 杰出</span>}
              </h3>
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="p-6 shadow hover:shadow-md transition-shadow mb-12">
        <h2 className="text-xl font-semibold mb-6">
          {t("cefrActflComparison")}
          {isMandarin && <div className="text-base font-normal text-gray-600">CEFR和ACTFL比较</div>}
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">
                  CEFR
                </th>
                <th className="py-2 px-4 border-b text-left">
                  ACTFL
                </th>
                <th className="py-2 px-4 border-b text-left">
                  {t("comparison")}
                  {isMandarin && <span className="block text-sm">比较</span>}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">C2</td>
                <td className="py-2 px-4 border-b">{t("distinguished")}{isMandarin && " (杰出)"}</td>
                <td className="py-2 px-4 border-b">
                  {isMandarin ? "母语或近母语水平" : "Native or near-native proficiency"}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">C1</td>
                <td className="py-2 px-4 border-b">{t("superior")}{isMandarin && " (优秀)"}</td>
                <td className="py-2 px-4 border-b">
                  {isMandarin ? "能够处理复杂任务，很少有明显错误" : "Can handle complex tasks with few obvious errors"}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">B2</td>
                <td className="py-2 px-4 border-b">
                  {t("advancedMid")} - {t("advancedHigh")}
                  {isMandarin && <span className="block text-sm">高级-中级 - 高级-高级</span>}
                </td>
                <td className="py-2 px-4 border-b">
                  {isMandarin ? "能够处理许多具体和抽象任务" : "Can handle many concrete and abstract tasks"}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">B1</td>
                <td className="py-2 px-4 border-b">
                  {t("intermediateMid")} - {t("advancedLow")}
                  {isMandarin && <span className="block text-sm">中级-中级 - 高级-低级</span>}
                </td>
                <td className="py-2 px-4 border-b">
                  {isMandarin ? "能够在非复杂情况下处理日常交流" : "Can handle routine exchanges in uncomplicated situations"}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">A2</td>
                <td className="py-2 px-4 border-b">
                  {t("noviceHigh")} - {t("intermediateLow")}
                  {isMandarin && <span className="block text-sm">初学者-高级 - 中级-低级</span>}
                </td>
                <td className="py-2 px-4 border-b">
                  {isMandarin ? "能够在简单情况下使用有限的语言" : "Can use limited language in simple situations"}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">A1</td>
                <td className="py-2 px-4 border-b">
                  {t("noviceLow")} - {t("noviceMid")}
                  {isMandarin && <span className="block text-sm">初学者-低级 - 初学者-中级</span>}
                </td>
                <td className="py-2 px-4 border-b">
                  {isMandarin ? "能够使用非常基础的语言" : "Can use very basic language"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      
      <Card className="p-6 shadow hover:shadow-md transition-shadow">
        <h2 className="text-xl font-semibold mb-4">
          {t("sublevels")}
          {isMandarin && <div className="text-base font-normal text-gray-600">子级别</div>}
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">CEFR</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
                <div key={level} className="bg-blue-50 p-3 rounded-md text-center">
                  <p className="font-medium text-blue-700">{level}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">ACTFL</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50 p-2 rounded-md text-center">
                  <p className="font-medium text-green-700">
                    {t("noviceLow")}
                    {isMandarin && <span className="block text-sm">初学者-低级</span>}
                  </p>
                </div>
                <div className="bg-green-50 p-2 rounded-md text-center">
                  <p className="font-medium text-green-700">
                    {t("noviceMid")}
                    {isMandarin && <span className="block text-sm">初学者-中级</span>}
                  </p>
                </div>
                <div className="bg-green-50 p-2 rounded-md text-center">
                  <p className="font-medium text-green-700">
                    {t("noviceHigh")}
                    {isMandarin && <span className="block text-sm">初学者-高级</span>}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50 p-2 rounded-md text-center">
                  <p className="font-medium text-green-700">
                    {t("intermediateLow")}
                    {isMandarin && <span className="block text-sm">中级-低级</span>}
                  </p>
                </div>
                <div className="bg-green-50 p-2 rounded-md text-center">
                  <p className="font-medium text-green-700">
                    {t("intermediateMid")}
                    {isMandarin && <span className="block text-sm">中级-中级</span>}
                  </p>
                </div>
                <div className="bg-green-50 p-2 rounded-md text-center">
                  <p className="font-medium text-green-700">
                    {t("intermediateHigh")}
                    {isMandarin && <span className="block text-sm">中级-高级</span>}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50 p-2 rounded-md text-center">
                  <p className="font-medium text-green-700">
                    {t("advancedLow")}
                    {isMandarin && <span className="block text-sm">高级-低级</span>}
                  </p>
                </div>
                <div className="bg-green-50 p-2 rounded-md text-center">
                  <p className="font-medium text-green-700">
                    {t("advancedMid")}
                    {isMandarin && <span className="block text-sm">高级-中级</span>}
                  </p>
                </div>
                <div className="bg-green-50 p-2 rounded-md text-center">
                  <p className="font-medium text-green-700">
                    {t("advancedHigh")}
                    {isMandarin && <span className="block text-sm">高级-高级</span>}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 p-2 rounded-md text-center">
                  <p className="font-medium text-green-700">
                    {t("superior")}
                    {isMandarin && <span className="block text-sm">优秀</span>}
                  </p>
                </div>
                <div className="bg-green-50 p-2 rounded-md text-center">
                  <p className="font-medium text-green-700">
                    {t("distinguished")}
                    {isMandarin && <span className="block text-sm">杰出</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LanguageFrameworks;

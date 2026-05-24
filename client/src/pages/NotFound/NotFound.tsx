import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
      <p className="text-muted-foreground mb-6">页面未找到</p>
      <Button onClick={() => navigate("/")}>返回首页</Button>
    </div>
  );
};

export default NotFound;

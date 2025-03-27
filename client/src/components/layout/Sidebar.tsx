import { Link, useLocation } from "wouter";
import {
  Palette,
  ChartBar,
  Code,
  LightbulbIcon,
  Heart,
  Plus,
  Sparkles,
  Clock,
  Star,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const [location] = useLocation();

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "palette":
        return <Palette className="w-4 h-4 mr-3" />;
      case "chart-simple":
        return <ChartBar className="w-4 h-4 mr-3" />;
      case "code":
        return <Code className="w-4 h-4 mr-3" />;
      case "lightbulb":
        return <LightbulbIcon className="w-4 h-4 mr-3" />;
      case "heart":
        return <Heart className="w-4 h-4 mr-3" />;
      default:
        return <Sparkles className="w-4 h-4 mr-3" />;
    }
  };

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-accent">
      <div className="p-4 border-b border-accent flex items-center">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center mr-2">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-xl font-semibold">PromptCraft</h1>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4">
        <ul>
          <li>
            <Link
              href="/"
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                location === "/"
                  ? "bg-primary text-white"
                  : "text-text hover:bg-accent",
              )}
            >
              <Sparkles className="mr-3 w-5 h-5" />
              <span>Discover</span>
            </Link>
          </li>

          <li>
            <Link
              href="/create"
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                location === "/create"
                  ? "bg-primary text-white"
                  : "text-text hover:bg-accent",
              )}
            >
              <Plus className="mr-3 w-5 h-5" />
              <span>Create New</span>
            </Link>
          </li>

          <li>
            <Link
              href="/favorites"
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                location === "/favorites"
                  ? "bg-primary text-white"
                  : "text-text hover:bg-accent",
              )}
            >
              <Star className="mr-3 w-5 h-5" />
              <span>Favorites</span>
            </Link>
          </li>

          <li>
            <Link
              href="/recent"
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                location === "/recent"
                  ? "bg-primary text-white"
                  : "text-text hover:bg-accent",
              )}
            >
              <Clock className="mr-3 w-5 h-5" />
              <span>Recent</span>
            </Link>
          </li>

          <li className="mt-6 mb-2 px-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Categories
            </h3>
          </li>

          {categories.map((category: any) => (
            <li key={category.id}>
              <Link
                href={`/category/${category.id}`}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  location === `/category/${category.id}`
                    ? "bg-primary text-white"
                    : "text-text hover:bg-accent",
                )}
              >
                {getCategoryIcon(category.icon)}
                <span>{category.name}</span>
              </Link>
            </li>
          ))}

          <li>
            <a className="flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg text-text hover:bg-accent transition-colors">
              <div className="flex items-center">
                <Plus className="mr-3 w-5 h-5" />
                <span>Add Category</span>
              </div>
            </a>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-accent">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-white font-medium">
            JD
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
          <button className="ml-auto p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-accent">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

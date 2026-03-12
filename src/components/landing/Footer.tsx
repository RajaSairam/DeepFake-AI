import { Shield, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg gradient-primary">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">DeepFake</span>
            </Link>
            <p className="text-muted-foreground max-w-md">
              AI-powered deepfake detection and scam prevention platform.
              Protecting individuals and businesses from digital fraud.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <Twitter className="w-5 h-5 text-muted-foreground" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <Github className="w-5 h-5 text-muted-foreground" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <Linkedin className="w-5 h-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} DeepFake. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
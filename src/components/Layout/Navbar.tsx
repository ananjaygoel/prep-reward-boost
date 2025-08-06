import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookOpen, LogOut, Settings, Trophy, User, Shield } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useUserRoles } from '@/hooks/useUserRoles';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, isContentCreator } = useUserRoles();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getPageName = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
        return 'Dashboard';
      case '/practice':
        return 'Practice';
      case '/study-plans':
        return 'Study Plans';
      case '/analytics':
        return 'Analytics';
      case '/mock-tests':
        return 'Mock Tests';
      case '/achievements':
        return 'Achievements';
      case '/profile':
        return 'Profile';
      case '/settings':
        return 'Settings';
      case '/admin':
        return 'Admin Panel';
      case '/intern':
        return 'Intern Portal';
      default:
        return 'JEEPrep.tech';
    }
  };

  const userInitials = user?.user_metadata?.full_name 
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <nav className="border-b bg-card shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gradient">JEEPrep.tech</span>
            </Link>
            <div className="h-6 w-px bg-border mx-2" />
            <h1 className="text-xl font-semibold text-foreground">{getPageName()}</h1>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/study-plans" className="text-sm font-medium transition-colors hover:text-primary">
              Study Plans
            </Link>
            <Link to="/analytics" className="text-sm font-medium transition-colors hover:text-primary">
              Analytics
            </Link>
            <Link to="/mock-tests" className="text-sm font-medium transition-colors hover:text-primary">
              Mock Tests
            </Link>
            <Link to="/achievements" className="text-sm font-medium transition-colors hover:text-primary">
              Achievements
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/achievements')}>
                  <Trophy className="mr-2 h-4 w-4" />
                  <span>Achievements</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                {isContentCreator && (
                  <DropdownMenuItem onClick={() => navigate('/intern')}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Intern Portal</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
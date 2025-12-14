'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { signOut } from '@/services/auth/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/services/supabase/client';

interface UserData {
  email: string;
}

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({ email: '' });
  const [originalData, setOriginalData] = useState<UserData>({ email: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/auth');
      return;
    }

    // Set user email data
    const userData = {
      email: user.email || ''
    };
    
    setUserData(userData);
    setOriginalData(userData);
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (!newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setIsPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast.success("Mật khẩu đã được thay đổi.");
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error("Có lỗi xảy ra khi thay đổi mật khẩu.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleteLoading(true);
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) {
        throw error;
      }

      toast.success("Tài khoản đã được xóa thành công.");
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("Có lỗi xảy ra khi xóa tài khoản.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-foreground">Tài khoản</h1>
          
          {/* Logout Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                Đăng xuất
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Đăng xuất</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn đăng xuất không?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>Đăng xuất</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Settings Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Cài đặt</h2>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Email:</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={userData.email}
                disabled
                className="bg-gray-100"
              />
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mật khẩu hiện tại:</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới:</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Nhập lại mật khẩu mới:</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>

              <Button 
                onClick={handleChangePassword}
                disabled={isPasswordLoading || !newPassword || !confirmPassword}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6"
              >
                {isPasswordLoading ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4">          
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Xóa tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Hành động này sẽ xóa vĩnh viễn tài khoản của bạn và tất cả dữ liệu liên quan. 
                Bạn sẽ không thể khôi phục lại sau khi xóa.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    Xóa tài khoản
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa tài khoản?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Tài khoản và tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      disabled={isDeleteLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleteLoading ? 'Đang xóa...' : 'Xóa tài khoản'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
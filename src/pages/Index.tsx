import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const API = {
  auth: 'https://functions.poehali.dev/df6c49ac-80ef-48fc-8f08-d4cbd85543dd',
  games: 'https://functions.poehali.dev/94ea32c1-f6d0-4b78-9dde-a4e1fbd73dd8',
  admin: 'https://functions.poehali.dev/91a49e46-cf05-4b9d-9452-6f250a5f23ec'
};

interface User {
  id: number;
  email: string;
  username: string;
  avatar_url?: string;
  role: string;
  balance: number;
  is_verified: boolean;
  time_spent_hours: number;
  is_banned?: boolean;
}

interface Game {
  id: number;
  title: string;
  description: string;
  genre: string;
  age_rating: string;
  price: number;
  logo_url: string;
  file_url: string;
  status: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingGames, setPendingGames] = useState<Game[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('gdestore_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      document.documentElement.classList.add('dark');
      loadGames();
      if (user.role === 'admin') {
        loadAdminData();
      }
    }
  }, [user]);

  const loadGames = async () => {
    try {
      const response = await fetch(`${API.games}?status=approved`);
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  };

  const loadAdminData = async () => {
    try {
      const [usersRes, gamesRes] = await Promise.all([
        fetch(`${API.admin}?action=users`),
        fetch(`${API.admin}?action=pending_games`)
      ]);
      const usersData = await usersRes.json();
      const gamesData = await gamesRes.json();
      setUsers(usersData);
      setPendingGames(gamesData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch(API.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('gdestore_user', JSON.stringify(data));
        setUser(data);
        toast.success('Вход выполнен успешно!');
      } else {
        toast.error(data.error || 'Ошибка входа');
      }
    } catch (error) {
      toast.error('Ошибка подключения');
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;

    try {
      const response = await fetch(API.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, password, username })
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('gdestore_user', JSON.stringify(data));
        setUser(data);
        toast.success('Регистрация успешна!');
      } else {
        toast.error(data.error || 'Ошибка регистрации');
      }
    } catch (error) {
      toast.error('Ошибка подключения');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gdestore_user');
    setUser(null);
    setActiveTab('home');
  };

  const handleBanUser = async (userId: number, isBanned: boolean) => {
    try {
      await fetch(API.admin, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban_user', user_id: userId, is_banned: !isBanned })
      });
      toast.success(isBanned ? 'Пользователь разблокирован' : 'Пользователь заблокирован');
      loadAdminData();
    } catch (error) {
      toast.error('Ошибка операции');
    }
  };

  const handleVerifyUser = async (userId: number, isVerified: boolean) => {
    try {
      await fetch(API.admin, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_user', user_id: userId, is_verified: !isVerified })
      });
      toast.success(isVerified ? 'Верификация снята' : 'Пользователь верифицирован');
      loadAdminData();
    } catch (error) {
      toast.error('Ошибка операции');
    }
  };

  const handleUpdateBalance = async (userId: number, newBalance: number) => {
    try {
      await fetch(API.admin, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_balance', user_id: userId, balance: newBalance })
      });
      toast.success('Баланс обновлён');
      loadAdminData();
    } catch (error) {
      toast.error('Ошибка операции');
    }
  };

  const handleApproveGame = async (gameId: number, status: string) => {
    try {
      await fetch(API.games, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, status })
      });
      toast.success(status === 'approved' ? 'Игра одобрена' : 'Игра отклонена');
      loadAdminData();
      loadGames();
    } catch (error) {
      toast.error('Ошибка операции');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Gamepad2" className="w-8 h-8 text-primary" />
              <CardTitle className="text-3xl font-bold">GDeStore</CardTitle>
            </div>
            <CardDescription>Игровая платформа для Android</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Пароль</Label>
                    <Input id="login-password" name="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full">Войти</Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Имя пользователя</Label>
                    <Input id="register-username" name="username" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input id="register-email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Пароль</Label>
                    <Input id="register-password" name="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full">Зарегистрироваться</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Icon name="Gamepad2" className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">GDeStore</h1>
            </div>
            <nav className="flex gap-4">
              <Button variant={activeTab === 'home' ? 'default' : 'ghost'} onClick={() => setActiveTab('home')}>
                <Icon name="Home" className="w-4 h-4 mr-2" />
                Магазин
              </Button>
              {user.role === 'admin' && (
                <Button variant={activeTab === 'admin' ? 'default' : 'ghost'} onClick={() => setActiveTab('admin')}>
                  <Icon name="Shield" className="w-4 h-4 mr-2" />
                  Админ-панель
                </Button>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Wallet" className="w-5 h-5 text-primary" />
              <span className="font-semibold">{user.balance.toFixed(2)} ₽</span>
              <Button size="sm" variant="outline" onClick={() => window.open('https://t.me/HE_CMOTRI_CYDA_EBANAT', '_blank')}>
                <Icon name="Plus" className="w-4 h-4" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{user.username}</span>
              {user.is_verified && <Icon name="CheckCircle2" className="w-4 h-4 text-secondary" />}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <Icon name="LogOut" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Каталог игр</h2>
            </div>
            {games.length === 0 ? (
              <Card className="p-12 text-center">
                <Icon name="Gamepad2" className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Игры скоро появятся</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {games.map((game) => (
                  <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-accent relative">
                      <img src={game.logo_url} alt={game.title} className="w-full h-full object-cover" />
                      <Badge className="absolute top-2 right-2">{game.age_rating}</Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{game.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{game.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">{game.genre}</Badge>
                        <span className="text-lg font-bold text-primary">{game.price} ₽</span>
                      </div>
                      <Button className="w-full">
                        <Icon name="ShoppingCart" className="w-4 h-4 mr-2" />
                        Купить
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && user.role === 'admin' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Админ-панель</h2>
            
            <Tabs defaultValue="users">
              <TabsList>
                <TabsTrigger value="users">Пользователи</TabsTrigger>
                <TabsTrigger value="moderation">Модерация игр</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Управление пользователями</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={u.avatar_url} />
                            <AvatarFallback>{u.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{u.username}</span>
                              {u.is_verified && <Icon name="CheckCircle2" className="w-4 h-4 text-secondary" />}
                              <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">{u.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              defaultValue={u.balance}
                              className="w-32"
                              onBlur={(e) => handleUpdateBalance(u.id, parseFloat(e.target.value))}
                            />
                            <span className="text-sm">₽</span>
                          </div>
                          <Button
                            size="sm"
                            variant={u.is_verified ? 'outline' : 'default'}
                            onClick={() => handleVerifyUser(u.id, u.is_verified)}
                          >
                            {u.is_verified ? 'Снять галочку' : 'Верифицировать'}
                          </Button>
                          <Button
                            size="sm"
                            variant={u.is_banned ? 'default' : 'destructive'}
                            onClick={() => handleBanUser(u.id, u.is_banned || false)}
                          >
                            {u.is_banned ? 'Разбанить' : 'Забанить'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="moderation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Игры на модерации</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingGames.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Нет игр на модерации</p>
                    ) : (
                      pendingGames.map((game) => (
                        <div key={game.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start gap-4">
                            <img src={game.logo_url} alt={game.title} className="w-24 h-24 rounded object-cover" />
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{game.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{game.description}</p>
                              <div className="flex gap-2">
                                <Badge>{game.genre}</Badge>
                                <Badge variant="outline">{game.age_rating}</Badge>
                                <Badge variant="secondary">{game.price} ₽</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button onClick={() => handleApproveGame(game.id, 'approved')} className="flex-1">
                              <Icon name="Check" className="w-4 h-4 mr-2" />
                              Одобрить
                            </Button>
                            <Button onClick={() => handleApproveGame(game.id, 'rejected')} variant="destructive" className="flex-1">
                              <Icon name="X" className="w-4 h-4 mr-2" />
                              Отклонить
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

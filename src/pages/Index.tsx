import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { useTranslation, type Language } from '@/lib/translations';

const API = {
  auth: 'https://functions.poehali.dev/df6c49ac-80ef-48fc-8f08-d4cbd85543dd',
  games: 'https://functions.poehali.dev/94ea32c1-f6d0-4b78-9dde-a4e1fbd73dd8',
  admin: 'https://functions.poehali.dev/91a49e46-cf05-4b9d-9452-6f250a5f23ec'
};

const LOGO_URL = 'https://www.dropbox.com/scl/fi/48km8n4287raygxlghdwd/image670.png?rlkey=3dbn8w75swtx0tyxsupw5re90&st=014gu15k&raw=1';

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
  active_frame_id?: number;
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
  contact_email?: string;
  created_by?: number;
  engine_type?: string;
}

interface Frame {
  id: number;
  name: string;
  image_url: string;
  price: number;
}

interface Purchase {
  game_id: number;
  game: Game;
}

const Index = () => {
  const [language, setLanguage] = useState<Language>('ru');
  const t = useTranslation(language);
  
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [games, setGames] = useState<Game[]>([]);
  const [userGames, setUserGames] = useState<Purchase[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingGames, setPendingGames] = useState<Game[]>([]);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [userFrames, setUserFrames] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<'gdevelop' | 'other' | null>(null);
  const [newGame, setNewGame] = useState({
    title: '', description: '', genre: '', age_rating: '0+',
    price: 0, logo_url: '', file_url: '', contact_email: '', engine_type: 'other'
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('gdestore_user');
    const savedLang = localStorage.getItem('gdestore_lang') as Language;
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    if (user) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gdestore_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadGames();
      loadUserGames();
      loadFrames();
      if (user.role === 'admin') {
        loadAdminData();
      }
    }
  }, [user?.id]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('gdestore_lang', lang);
  };

  const loadGames = async () => {
    try {
      const response = await fetch(`${API.games}?status=approved`);
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  };

  const loadUserGames = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API.auth}?action=library&user_id=${user.id}`);
      const data = await response.json();
      setUserGames(data);
    } catch (error) {
      console.error('Failed to load user games:', error);
    }
  };

  const loadFrames = async () => {
    try {
      const response = await fetch(`${API.auth}?action=frames`);
      const data = await response.json();
      setFrames(data);
      
      if (user) {
        const userFramesRes = await fetch(`${API.auth}?action=user_frames&user_id=${user.id}`);
        const userFramesData = await userFramesRes.json();
        setUserFrames(userFramesData.map((f: any) => f.frame_id));
      }
    } catch (error) {
      console.error('Failed to load frames:', error);
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
        toast.success(t.auth.loginSuccess);
      } else {
        toast.error(data.error || t.auth.loginError);
      }
    } catch (error) {
      toast.error(t.auth.connectionError);
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
        toast.success(t.auth.registerSuccess);
      } else {
        toast.error(data.error || t.auth.registerError);
      }
    } catch (error) {
      toast.error(t.auth.connectionError);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gdestore_user');
    setUser(null);
    setActiveTab('home');
  };

  const handleEngineSelection = async (engine: 'gdevelop' | 'other') => {
    if (engine === 'other') {
      if (!user || user.balance < 50) {
        toast.error(t.publish.paymentRequired);
        return;
      }
      
      const newBalance = user.balance - 50;
      try {
        await fetch(API.admin, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_balance', user_id: user.id, balance: newBalance })
        });
        setUser({ ...user, balance: newBalance });
        toast.success(t.publish.paymentSuccess);
      } catch (error) {
        toast.error(t.common.error);
        return;
      }
    }
    
    setSelectedEngine(engine);
    setNewGame({ ...newGame, engine_type: engine });
  };

  const handlePublishGame = async () => {
    if (!user || !selectedEngine) return;
    
    try {
      const response = await fetch(API.games, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'submit', 
          ...newGame,
          user_id: user.id
        })
      });
      
      if (response.ok) {
        toast.success(t.publish.publishSuccess);
        setShowPublishDialog(false);
        setSelectedEngine(null);
        setNewGame({ title: '', description: '', genre: '', age_rating: '0+', price: 0, logo_url: '', file_url: '', contact_email: '', engine_type: 'other' });
        setTimeout(() => toast.dismiss(), 5000);
      }
    } catch (error) {
      toast.error(t.publish.publishError);
    }
  };

  const handlePurchaseGame = async (gameId: number, price: number) => {
    if (!user) return;
    if (user.balance < price) {
      toast.error(t.shop.notEnoughMoney);
      return;
    }

    try {
      const response = await fetch(API.games, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purchase', user_id: user.id, game_id: gameId })
      });
      
      if (response.ok) {
        toast.success(t.shop.purchaseSuccess);
        setUser({ ...user, balance: user.balance - price });
        loadUserGames();
      } else {
        const data = await response.json();
        toast.error(data.error || t.common.error);
      }
    } catch (error) {
      toast.error(t.common.error);
    }
  };

  const handleDeleteGame = async (gameId: number) => {
    if (!user) return;
    
    try {
      const response = await fetch(API.games, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, game_id: gameId })
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`${t.library.deleteSuccess} ${data.refund.toFixed(2)} ₽ (90%)`);
        setUser({ ...user, balance: user.balance + data.refund });
        loadUserGames();
      }
    } catch (error) {
      toast.error(t.common.error);
    }
  };

  const handlePurchaseFrame = async (frameId: number, price: number) => {
    if (!user) return;
    if (user.balance < price) {
      toast.error(t.frames.notEnoughMoney);
      return;
    }

    try {
      const response = await fetch(API.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purchase_frame', user_id: user.id, frame_id: frameId })
      });
      
      if (response.ok) {
        toast.success(t.frames.purchaseSuccess);
        setUser({ ...user, balance: user.balance - price });
        loadFrames();
      }
    } catch (error) {
      toast.error(t.common.error);
    }
  };

  const handleSetActiveFrame = async (frameId: number | null) => {
    if (!user) return;

    try {
      await fetch(API.auth, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_frame', user_id: user.id, frame_id: frameId })
      });
      
      setUser({ ...user, active_frame_id: frameId || undefined });
      toast.success(frameId ? t.frames.installSuccess : t.frames.removeSuccess);
    } catch (error) {
      toast.error(t.common.error);
    }
  };

  const handleUpdateProfile = async (username: string, avatarUrl: string) => {
    if (!user) return;

    try {
      await fetch(API.auth, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_profile', user_id: user.id, username, avatar_url: avatarUrl })
      });
      
      setUser({ ...user, username, avatar_url: avatarUrl });
      toast.success(t.profile.updateSuccess);
    } catch (error) {
      toast.error(t.common.error);
    }
  };

  const handleBanUser = async (userId: number, isBanned: boolean) => {
    try {
      await fetch(API.admin, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban_user', user_id: userId, is_banned: !isBanned })
      });
      toast.success(isBanned ? t.admin.userUnbanned : t.admin.userBanned);
      loadAdminData();
    } catch (error) {
      toast.error(t.common.error);
    }
  };

  const handleVerifyUser = async (userId: number, isVerified: boolean) => {
    try {
      await fetch(API.admin, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_user', user_id: userId, is_verified: !isVerified })
      });
      toast.success(isVerified ? t.admin.verificationRemoved : t.admin.userVerified);
      loadAdminData();
    } catch (error) {
      toast.error(t.common.error);
    }
  };

  const handleUpdateBalance = async (userId: number, newBalance: number) => {
    try {
      await fetch(API.admin, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_balance', user_id: userId, balance: newBalance })
      });
      toast.success(t.admin.balanceUpdated);
      await loadAdminData();
    } catch (error) {
      toast.error(t.common.error);
    }
  };

  const handleAddBalance = async (userId: number, currentBalance: number, amountToAdd: number) => {
    if (amountToAdd <= 0) {
      toast.error('Сумма должна быть больше 0');
      return;
    }
    try {
      const newBalance = currentBalance + amountToAdd;
      await fetch(API.admin, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_balance', user_id: userId, balance: newBalance })
      });
      toast.success(t.admin.balanceAdded + `: +${amountToAdd} ₽`);
      await loadAdminData();
    } catch (error) {
      toast.error(t.common.error);
    }
  };

  const handleApproveGame = async (gameId: number, status: string) => {
    try {
      await fetch(API.games, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, status })
      });
      toast.success(status === 'approved' ? t.admin.gameApproved : t.admin.gameRejected);
      loadAdminData();
      loadGames();
    } catch (error) {
      toast.error(t.common.error);
    }
  };

  const handleCreateFrame = async (name: string, imageUrl: string, price: number) => {
    try {
      await fetch(API.admin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_frame', name, image_url: imageUrl, price })
      });
      toast.success(t.admin.frameCreated);
      loadFrames();
    } catch (error) {
      toast.error(t.common.error);
    }
  };

  const handleDownloadSite = () => {
    toast.info(language === 'ru' 
      ? 'Функция доступна после подключения GitHub репозитория в настройках проекта' 
      : 'Feature available after connecting GitHub repository in project settings');
  };

  const isGamePurchased = (gameId: number) => {
    return userGames.some(p => p.game_id === gameId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1b2838] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#16202d] border-[#2a475e]">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src={LOGO_URL} alt="Logo" className="w-8 h-8" />
                <CardTitle className="text-3xl font-bold text-white">{t.app.name}</CardTitle>
              </div>
              <Select value={language} onValueChange={(v) => changeLanguage(v as Language)}>
                <SelectTrigger className="w-24 bg-[#32475c] border-[#2a475e] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#16202d] border-[#2a475e]">
                  <SelectItem value="ru" className="text-white">RU</SelectItem>
                  <SelectItem value="en" className="text-white">EN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription className="text-gray-400">{t.app.tagline}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 bg-[#1b2838]">
                <TabsTrigger value="login" className="data-[state=active]:bg-[#66c0f4] data-[state=active]:text-black">{t.auth.login}</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-[#66c0f4] data-[state=active]:text-black">{t.auth.register}</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-300">{t.auth.email}</Label>
                    <Input id="login-email" name="email" type="email" required className="bg-[#32475c] border-[#2a475e] text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-300">{t.auth.password}</Label>
                    <Input id="login-password" name="password" type="password" required className="bg-[#32475c] border-[#2a475e] text-white" />
                  </div>
                  <Button type="submit" className="w-full bg-[#66c0f4] hover:bg-[#5ab1e6] text-black font-semibold">{t.auth.loginButton}</Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className="text-gray-300">{t.auth.username}</Label>
                    <Input id="register-username" name="username" required className="bg-[#32475c] border-[#2a475e] text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-gray-300">{t.auth.email}</Label>
                    <Input id="register-email" name="email" type="email" required className="bg-[#32475c] border-[#2a475e] text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-gray-300">{t.auth.password}</Label>
                    <Input id="register-password" name="password" type="password" required className="bg-[#32475c] border-[#2a475e] text-white" />
                  </div>
                  <Button type="submit" className="w-full bg-[#66c0f4] hover:bg-[#5ab1e6] text-black font-semibold">{t.auth.registerButton}</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1b2838]">
      <header className="border-b border-[#2a475e] bg-[#171a21] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <img src={LOGO_URL} alt="Logo" className="w-6 h-6" />
              <h1 className="text-xl font-bold text-white">{t.app.name}</h1>
            </div>
            <nav className="flex gap-2">
              <Button 
                variant={activeTab === 'home' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('home')}
                className={activeTab === 'home' ? 'bg-[#66c0f4] text-black hover:bg-[#5ab1e6]' : 'text-gray-300 hover:text-white hover:bg-[#2a475e]'}
              >
                <Icon name="Home" className="w-4 h-4 mr-2" />
                {t.nav.shop}
              </Button>
              <Button 
                variant={activeTab === 'library' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('library')}
                className={activeTab === 'library' ? 'bg-[#66c0f4] text-black hover:bg-[#5ab1e6]' : 'text-gray-300 hover:text-white hover:bg-[#2a475e]'}
              >
                <Icon name="Library" className="w-4 h-4 mr-2" />
                {t.nav.library}
              </Button>
              <Button 
                variant={activeTab === 'frames' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('frames')}
                className={activeTab === 'frames' ? 'bg-[#66c0f4] text-black hover:bg-[#5ab1e6]' : 'text-gray-300 hover:text-white hover:bg-[#2a475e]'}
              >
                <Icon name="Image" className="w-4 h-4 mr-2" />
                {t.nav.frames}
              </Button>
              {user.role === 'admin' && (
                <Button 
                  variant={activeTab === 'admin' ? 'default' : 'ghost'} 
                  onClick={() => setActiveTab('admin')}
                  className={activeTab === 'admin' ? 'bg-[#66c0f4] text-black hover:bg-[#5ab1e6]' : 'text-gray-300 hover:text-white hover:bg-[#2a475e]'}
                >
                  <Icon name="Shield" className="w-4 h-4 mr-2" />
                  {t.nav.admin}
                </Button>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Wallet" className="w-5 h-5 text-[#66c0f4]" />
              <span className="font-semibold text-white">{user.balance.toFixed(2)} ₽</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => window.open('https://t.me/HE_CMOTRI_CYDA_EBANAT', '_blank')}
                className="border-[#66c0f4] text-[#66c0f4] hover:bg-[#66c0f4] hover:text-black"
              >
                <Icon name="Plus" className="w-4 h-4" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-6 bg-[#2a475e]" />
            <Button 
              variant="ghost" 
              onClick={() => setShowSettingsDialog(true)}
              className="text-gray-300 hover:text-white hover:bg-[#2a475e]"
            >
              <Icon name="Settings" className="w-5 h-5" />
            </Button>
            <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-[#2a475e]">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-[#66c0f4] text-black">{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {user.active_frame_id && (
                      <div className="absolute inset-0 pointer-events-none">
                        <img 
                          src={frames.find(f => f.id === user.active_frame_id)?.image_url} 
                          alt="Frame" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <span className="font-medium">{user.username}</span>
                  {user.is_verified && <Icon name="CheckCircle2" className="w-4 h-4 text-green-500" />}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#16202d] border-[#2a475e] text-white">
                <DialogHeader>
                  <DialogTitle>{t.profile.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">{t.profile.username}</Label>
                    <Input 
                      defaultValue={user.username} 
                      onBlur={(e) => handleUpdateProfile(e.target.value, user.avatar_url || '')}
                      className="bg-[#32475c] border-[#2a475e] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">{t.profile.avatarUrl}</Label>
                    <Input 
                      defaultValue={user.avatar_url || ''} 
                      onBlur={(e) => handleUpdateProfile(user.username, e.target.value)}
                      className="bg-[#32475c] border-[#2a475e] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">{t.profile.timeSpent}</Label>
                    <p className="text-[#66c0f4]">{user.time_spent_hours} {t.profile.hours}</p>
                  </div>
                  <Button onClick={handleLogout} variant="destructive" className="w-full">
                    <Icon name="LogOut" className="w-4 h-4 mr-2" />
                    {t.auth.logout}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-[#16202d] border-[#2a475e] text-white">
          <DialogHeader>
            <DialogTitle>{t.settings.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">{t.settings.language}</Label>
              <Select value={language} onValueChange={(v) => changeLanguage(v as Language)}>
                <SelectTrigger className="bg-[#32475c] border-[#2a475e] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#16202d] border-[#2a475e]">
                  <SelectItem value="ru" className="text-white">{t.settings.russian}</SelectItem>
                  <SelectItem value="en" className="text-white">{t.settings.english}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">{t.shop.title}</h2>
              <Dialog open={showPublishDialog} onOpenChange={(open) => { setShowPublishDialog(open); if (!open) setSelectedEngine(null); }}>
                <DialogTrigger asChild>
                  <Button className="bg-[#66c0f4] hover:bg-[#5ab1e6] text-black font-semibold">
                    <Icon name="Upload" className="w-4 h-4 mr-2" />
                    {t.shop.publishGame}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#16202d] border-[#2a475e] text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t.publish.title}</DialogTitle>
                    <DialogDescription className="text-gray-400">{t.publish.description}</DialogDescription>
                  </DialogHeader>
                  
                  {!selectedEngine ? (
                    <div className="space-y-4">
                      <Label className="text-gray-300">{t.publish.selectEngine}</Label>
                      <RadioGroup value={selectedEngine || ''} onValueChange={(v) => handleEngineSelection(v as 'gdevelop' | 'other')}>
                        <div className="flex items-center space-x-2 p-4 border border-[#2a475e] rounded-lg hover:bg-[#1b2838] cursor-pointer">
                          <RadioGroupItem value="gdevelop" id="gdevelop" />
                          <Label htmlFor="gdevelop" className="flex-1 cursor-pointer">
                            {t.publish.gdevelopFree}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border border-[#2a475e] rounded-lg hover:bg-[#1b2838] cursor-pointer">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other" className="flex-1 cursor-pointer">
                            {t.publish.otherEnginePaid}
                          </Label>
                        </div>
                      </RadioGroup>
                      <p className="text-sm text-gray-400">{t.publish.pcGamesOnly}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">{t.publish.gameName}</Label>
                        <Input value={newGame.title} onChange={(e) => setNewGame({...newGame, title: e.target.value})} className="bg-[#32475c] border-[#2a475e] text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">{t.publish.gameDescription}</Label>
                        <Textarea value={newGame.description} onChange={(e) => setNewGame({...newGame, description: e.target.value})} className="bg-[#32475c] border-[#2a475e] text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300">{t.publish.genre}</Label>
                          <Input value={newGame.genre} onChange={(e) => setNewGame({...newGame, genre: e.target.value})} placeholder={t.publish.genrePlaceholder} className="bg-[#32475c] border-[#2a475e] text-white" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">{t.publish.ageRating}</Label>
                          <Select value={newGame.age_rating} onValueChange={(v) => setNewGame({...newGame, age_rating: v})}>
                            <SelectTrigger className="bg-[#32475c] border-[#2a475e] text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#16202d] border-[#2a475e] text-white">
                              <SelectItem value="0+">0+</SelectItem>
                              <SelectItem value="6+">6+</SelectItem>
                              <SelectItem value="12+">12+</SelectItem>
                              <SelectItem value="16+">16+</SelectItem>
                              <SelectItem value="18+">18+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">{t.publish.price}</Label>
                        <Input type="number" value={newGame.price} onChange={(e) => setNewGame({...newGame, price: parseFloat(e.target.value)})} className="bg-[#32475c] border-[#2a475e] text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">{t.publish.logoUrl}</Label>
                        <Input value={newGame.logo_url} onChange={(e) => setNewGame({...newGame, logo_url: e.target.value})} className="bg-[#32475c] border-[#2a475e] text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">{t.publish.fileUrl}</Label>
                        <Input value={newGame.file_url} onChange={(e) => setNewGame({...newGame, file_url: e.target.value})} className="bg-[#32475c] border-[#2a475e] text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">{t.publish.contactEmail}</Label>
                        <Input type="email" value={newGame.contact_email} onChange={(e) => setNewGame({...newGame, contact_email: e.target.value})} className="bg-[#32475c] border-[#2a475e] text-white" />
                      </div>
                      <Button onClick={handlePublishGame} className="w-full bg-[#66c0f4] hover:bg-[#5ab1e6] text-black font-semibold">{t.publish.publishButton}</Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
            {games.length === 0 ? (
              <Card className="p-12 text-center bg-[#16202d] border-[#2a475e]">
                <Icon name="Gamepad2" className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p className="text-lg text-gray-400">{t.shop.noGames}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {games.map((game) => {
                  const purchased = isGamePurchased(game.id);
                  return (
                    <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-[#16202d] border-[#2a475e]">
                      <div className="aspect-video bg-[#2a475e] relative">
                        <img src={game.logo_url} alt={game.title} className="w-full h-full object-cover" />
                        <Badge className="absolute top-2 right-2 bg-[#66c0f4] text-black">{game.age_rating}</Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg text-white">{game.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-gray-400">{game.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="border-[#66c0f4] text-[#66c0f4]">{game.genre}</Badge>
                          <span className="text-lg font-bold text-[#66c0f4]">{game.price} ₽</span>
                        </div>
                        <Button className={purchased ? 'w-full bg-green-600 hover:bg-green-700' : 'w-full bg-[#66c0f4] hover:bg-[#5ab1e6] text-black font-semibold'} onClick={() => !purchased && handlePurchaseGame(game.id, game.price)} disabled={purchased}>
                          {purchased ? <><Icon name="Check" className="w-4 h-4 mr-2" />{t.shop.purchased}</> : <><Icon name="ShoppingCart" className="w-4 h-4 mr-2" />{t.shop.buy}</>}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">{t.library.title}</h2>
            {userGames.length === 0 ? (
              <Card className="p-12 text-center bg-[#16202d] border-[#2a475e]">
                <Icon name="Library" className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p className="text-lg text-gray-400">{t.library.noGames}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userGames.map((purchase) => (
                  <Card key={purchase.game_id} className="overflow-hidden bg-[#16202d] border-[#2a475e]">
                    <div className="aspect-video bg-[#2a475e] relative">
                      <img src={purchase.game.logo_url} alt={purchase.game.title} className="w-full h-full object-cover" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg text-white">{purchase.game.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full bg-[#66c0f4] hover:bg-[#5ab1e6] text-black font-semibold" asChild>
                        <a href={purchase.game.file_url} download>
                          <Icon name="Download" className="w-4 h-4 mr-2" />
                          {t.library.download}
                        </a>
                      </Button>
                      <Button variant="destructive" className="w-full" onClick={() => handleDeleteGame(purchase.game_id)}>
                        <Icon name="Trash2" className="w-4 h-4 mr-2" />
                        {t.library.delete}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'frames' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">{t.frames.title}</h2>
            <Tabs defaultValue="shop">
              <TabsList className="bg-[#1b2838]">
                <TabsTrigger value="shop" className="data-[state=active]:bg-[#66c0f4] data-[state=active]:text-black">{t.frames.shop}</TabsTrigger>
                <TabsTrigger value="my" className="data-[state=active]:bg-[#66c0f4] data-[state=active]:text-black">{t.frames.myFrames}</TabsTrigger>
              </TabsList>
              <TabsContent value="shop">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {frames.map((frame) => {
                    const owned = userFrames.includes(frame.id);
                    return (
                      <Card key={frame.id} className="p-4 bg-[#16202d] border-[#2a475e]">
                        <img src={frame.image_url} alt={frame.name} className="w-full aspect-square object-cover rounded mb-2" />
                        <p className="text-sm text-white text-center mb-2">{frame.name}</p>
                        <p className="text-sm text-[#66c0f4] text-center mb-2">{frame.price} ₽</p>
                        <Button size="sm" className={owned ? 'w-full bg-green-600' : 'w-full bg-[#66c0f4] hover:bg-[#5ab1e6] text-black'} onClick={() => !owned && handlePurchaseFrame(frame.id, frame.price)} disabled={owned}>
                          {owned ? t.frames.purchased : t.frames.buy}
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
              <TabsContent value="my">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {frames.filter(f => userFrames.includes(f.id)).map((frame) => (
                    <Card key={frame.id} className="p-4 bg-[#16202d] border-[#2a475e]">
                      <img src={frame.image_url} alt={frame.name} className="w-full aspect-square object-cover rounded mb-2" />
                      <p className="text-sm text-white text-center mb-2">{frame.name}</p>
                      <Button size="sm" variant={user.active_frame_id === frame.id ? 'destructive' : 'default'} className={user.active_frame_id !== frame.id ? 'w-full bg-[#66c0f4] hover:bg-[#5ab1e6] text-black' : 'w-full'} onClick={() => handleSetActiveFrame(user.active_frame_id === frame.id ? null : frame.id)}>
                        {user.active_frame_id === frame.id ? t.frames.remove : t.frames.install}
                      </Button>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === 'admin' && user.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">{t.admin.title}</h2>
              <Button onClick={handleDownloadSite} className="bg-[#66c0f4] hover:bg-[#5ab1e6] text-black font-semibold">
                <Icon name="Download" className="w-4 h-4 mr-2" />
                {t.admin.downloadSite}
              </Button>
            </div>
            
            <Tabs defaultValue="users">
              <TabsList className="bg-[#1b2838]">
                <TabsTrigger value="users" className="data-[state=active]:bg-[#66c0f4] data-[state=active]:text-black">{t.admin.users}</TabsTrigger>
                <TabsTrigger value="moderation" className="data-[state=active]:bg-[#66c0f4] data-[state=active]:text-black">{t.admin.moderation}</TabsTrigger>
                <TabsTrigger value="frames" className="data-[state=active]:bg-[#66c0f4] data-[state=active]:text-black">{t.admin.createFrame}</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                <Card className="bg-[#16202d] border-[#2a475e]">
                  <CardHeader>
                    <CardTitle className="text-white">{t.admin.users}</CardTitle>
                    <div className="pt-2">
                      <Input placeholder={t.admin.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-[#32475c] border-[#2a475e] text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 border border-[#2a475e] rounded-lg bg-[#1b2838]">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={u.avatar_url} />
                              <AvatarFallback className="bg-[#66c0f4] text-black">{u.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {u.active_frame_id && (
                              <div className="absolute inset-0 pointer-events-none">
                                <img src={frames.find(f => f.id === u.active_frame_id)?.image_url} alt="Frame" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{u.username}</span>
                              {u.is_verified && <Icon name="CheckCircle2" className="w-4 h-4 text-green-500" />}
                              <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className={u.role === 'admin' ? 'bg-[#66c0f4] text-black' : ''}>{u.role}</Badge>
                            </div>
                            <span className="text-sm text-gray-400">{u.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 w-24">{t.admin.currentBalance}:</span>
                              <span className="text-sm text-[#66c0f4] font-semibold">{u.balance.toFixed(2)} ₽</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input 
                                type="number" 
                                placeholder={t.admin.addBalancePlaceholder}
                                className="w-32 bg-[#32475c] border-[#2a475e] text-white" 
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const amount = parseFloat((e.target as HTMLInputElement).value);
                                    if (amount > 0) {
                                      handleAddBalance(u.id, u.balance, amount);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                }}
                              />
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={(e) => {
                                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                  const amount = parseFloat(input.value);
                                  if (amount > 0) {
                                    handleAddBalance(u.id, u.balance, amount);
                                    input.value = '';
                                  }
                                }}
                              >
                                <Icon name="Plus" className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <Button size="sm" variant={u.is_verified ? 'outline' : 'default'} onClick={() => handleVerifyUser(u.id, u.is_verified)} className={!u.is_verified ? 'bg-[#66c0f4] hover:bg-[#5ab1e6] text-black' : 'border-[#66c0f4] text-[#66c0f4]'}>
                            {u.is_verified ? t.admin.removeVerification : t.admin.verify}
                          </Button>
                          <Button size="sm" variant={u.is_banned ? 'default' : 'destructive'} onClick={() => handleBanUser(u.id, u.is_banned || false)}>
                            {u.is_banned ? t.admin.unban : t.admin.ban}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="moderation" className="space-y-4">
                <Card className="bg-[#16202d] border-[#2a475e]">
                  <CardHeader>
                    <CardTitle className="text-white">{t.admin.moderation}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingGames.length === 0 ? (
                      <p className="text-center text-gray-400 py-8">{t.admin.noPendingGames}</p>
                    ) : (
                      pendingGames.map((game) => (
                        <div key={game.id} className="border border-[#2a475e] rounded-lg p-4 space-y-3 bg-[#1b2838]">
                          <div className="flex items-start gap-4">
                            <img src={game.logo_url} alt={game.title} className="w-24 h-24 rounded object-cover" />
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-white">{game.title}</h3>
                              <p className="text-sm text-gray-400 mb-2">{game.description}</p>
                              <div className="flex gap-2 mb-2">
                                <Badge className="bg-[#66c0f4] text-black">{game.genre}</Badge>
                                <Badge variant="outline" className="border-[#66c0f4] text-[#66c0f4]">{game.age_rating}</Badge>
                                <Badge variant="secondary">{game.price} ₽</Badge>
                                <Badge className={game.engine_type === 'gdevelop' ? 'bg-green-600' : 'bg-orange-600'}>
                                  {game.engine_type === 'gdevelop' ? t.admin.gdevelop : t.admin.otherEngine}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400">{t.admin.contactEmail}: {game.contact_email}</p>
                              <Button size="sm" variant="outline" asChild className="mt-2 border-[#66c0f4] text-[#66c0f4]">
                                <a href={game.file_url} download>
                                  <Icon name="Download" className="w-4 h-4 mr-2" />
                                  {t.admin.downloadApk}
                                </a>
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button onClick={() => handleApproveGame(game.id, 'approved')} className="flex-1 bg-[#66c0f4] hover:bg-[#5ab1e6] text-black font-semibold">
                              <Icon name="Check" className="w-4 h-4 mr-2" />
                              {t.admin.approve}
                            </Button>
                            <Button onClick={() => handleApproveGame(game.id, 'rejected')} variant="destructive" className="flex-1">
                              <Icon name="X" className="w-4 h-4 mr-2" />
                              {t.admin.reject}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="frames">
                <Card className="bg-[#16202d] border-[#2a475e]">
                  <CardHeader>
                    <CardTitle className="text-white">{t.admin.createFrame}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleCreateFrame(formData.get('name') as string, formData.get('image_url') as string, parseFloat(formData.get('price') as string));
                      e.currentTarget.reset();
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">{t.admin.frameName}</Label>
                        <Input name="name" required className="bg-[#32475c] border-[#2a475e] text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">{t.admin.frameImageUrl}</Label>
                        <Input name="image_url" required className="bg-[#32475c] border-[#2a475e] text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">{t.admin.framePrice}</Label>
                        <Input name="price" type="number" required className="bg-[#32475c] border-[#2a475e] text-white" />
                      </div>
                      <Button type="submit" className="w-full bg-[#66c0f4] hover:bg-[#5ab1e6] text-black font-semibold">{t.admin.createFrameButton}</Button>
                    </form>
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
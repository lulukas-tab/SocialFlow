import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Switch,
} from 'react-native';


const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const register = async (email, password) => {
    try {
      setLoading(true);
      if (password.length < 6) {
        throw new Error('Senha deve ter no mínimo 6 caracteres');
      }
      setUser({ email, uid: Math.random().toString() });
      return { email, uid: Math.random().toString() };
    } catch (err) {
      Alert.alert('Erro', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      setUser({ email, uid: Math.random().toString() });
      return { email, uid: Math.random().toString() };
    } catch (err) {
      Alert.alert('Erro', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setUser(null);
    } catch (err) {
      Alert.alert('Erro', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };
};

const useFetchPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10');
      if (!response.ok) throw new Error('Erro ao buscar posts');
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = async () => {
    await fetchPosts();
  };

  return { posts, loading, error, refreshPosts };
};

// ============================================
// TEMA
// ============================================

const getThemeColors = (isDark) => {
  if (isDark) {
    return {
      background: '#1a1a1a',
      surface: '#2d2d2d',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      primary: '#4A90E2',
      border: '#404040',
      card: '#333333',
    };
  }
  return {
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    primary: '#4A90E2',
    border: '#DDD',
    card: '#FFFFFF',
  };
};



const LoadingSpinner = ({ size = 'large', color = '#4A90E2' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size={size} color={color} />
    <Text style={styles.loadingText}>Carregando...</Text>
  </View>
);

const PostCard = ({ post, onPress, isDark }) => {
  const colors = getThemeColors(isDark);
  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.postId, { color: colors.primary }]}>Post #{post.id}</Text>
        <Text style={[styles.userId, { color: colors.textSecondary }]}>Usuário {post.userId}</Text>
      </View>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{post.title}</Text>
      <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={3}>{post.body}</Text>
      <View style={styles.cardFooter}>
        <Text style={[styles.readMore, { color: colors.primary }]}>Leia mais →</Text>
      </View>
    </TouchableOpacity>
  );
};

// ============================================
// TELAS
// ============================================

const LoginScreen = ({ onLoginSuccess, isDark }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register, loading } = useAuth();
  const colors = getThemeColors(isDark);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    try {
      const user = await login(email, password);
      onLoginSuccess(user);
    } catch (error) {
     
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    try {
      await register(email, password);
      Alert.alert('Sucesso', 'Conta criada! Faça login agora');
      setIsRegistering(false);
      setPassword('');
    } catch (error) {
      // Erro já foi mostrado no hook
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{isRegistering ? 'Criar Conta' : 'Bem-vindo'}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isRegistering ? 'Crie uma nova conta' : 'Faça login para continuar'}
          </Text>
        </View>

        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Senha"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={isRegistering ? handleRegister : handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Carregando...' : isRegistering ? 'Registrar' : 'Login'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)} disabled={loading}>
            <Text style={[styles.toggleText, { color: colors.primary }]}>
              {isRegistering ? 'Já tem conta? Faça login' : 'Não tem conta? Registre-se'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Lucas Almeida - RA 22403149</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const DashboardScreen = ({ onNavigateToDetails, onLogout, isDark }) => {
  const { posts, loading, error, refreshPosts } = useFetchPosts();
  const colors = getThemeColors(isDark);

  if (loading && posts.length === 0) return <LoadingSpinner />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.dashboardHeader, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.dashboardTitle, { color: '#FFFFFF' }]}>Posts da Comunidade</Text>
          <TouchableOpacity onPress={onLogout} style={[styles.logoutHeaderButton, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <Text style={styles.logoutHeaderText}>Sair</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.dashboardSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>{posts.length} posts</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: '#E74C3C' }]}>Erro ao carregar posts</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshPosts}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => onNavigateToDetails(item)}
              isDark={isDark}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refreshPosts} colors={['#4A90E2']} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const PostDetailsScreen = ({ post, onGoBack, isDark }) => {
  const colors = getThemeColors(isDark);
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.detailsHeader, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={onGoBack} activeOpacity={0.7} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.detailsContent, { backgroundColor: colors.background }]}>
        <View style={[styles.postInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.postNumber, { color: colors.primary }]}>Post #{post.id}</Text>
          <Text style={[styles.userInfo, { color: colors.textSecondary }]}>Usuário ID: {post.userId}</Text>
        </View>

        <Text style={[styles.detailsTitle, { color: colors.text }]}>{post.title}</Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Text style={[styles.bodyLabel, { color: colors.textSecondary }]}>Conteúdo Completo:</Text>
        <Text style={[styles.detailsBody, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}>{post.body}</Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.metadata}>
          <View style={[styles.metadataItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>ID do Post</Text>
            <Text style={[styles.metadataValue, { color: colors.text }]}>{post.id}</Text>
          </View>
          <View style={[styles.metadataItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>ID do Usuário</Text>
            <Text style={[styles.metadataValue, { color: colors.text }]}>{post.userId}</Text>
          </View>
        </View>

        <View style={[styles.detailsFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Lucas Almeida - RA 22403149</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const EditProfileScreen = ({ user, onGoBack, isDark }) => {
  const [name, setName] = useState(user?.email?.split('@')[0] || 'Usuário');
  const [bio, setBio] = useState('Desenvolvedor apaixonado por tecnologia');
  const colors = getThemeColors(isDark);

  const handleSave = () => {
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    onGoBack();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.detailsHeader, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={onGoBack} activeOpacity={0.7} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.detailsContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.detailsTitle, { color: colors.text }]}>Editar Perfil</Text>
        
        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>Nome</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Bio</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, height: 100 }]}
            value={bio}
            onChangeText={setBio}
            multiline
            placeholderTextColor={colors.textSecondary}
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Salvar Alterações</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const NotificationsScreen = ({ onGoBack, isDark }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const colors = getThemeColors(isDark);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.detailsHeader, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={onGoBack} activeOpacity={0.7} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.detailsContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.detailsTitle, { color: colors.text }]}>Notificações</Text>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.notificationItem}>
            <Text style={[styles.notificationLabel, { color: colors.text }]}>Notificações Push</Text>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: colors.border, true: '#4A90E2' }}
              thumbColor={pushNotifications ? '#4A90E2' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.notificationItem}>
            <Text style={[styles.notificationLabel, { color: colors.text }]}>Notificações por Email</Text>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: colors.border, true: '#4A90E2' }}
              thumbColor={emailNotifications ? '#4A90E2' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const PrivacyScreen = ({ onGoBack, isDark }) => {
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const colors = getThemeColors(isDark);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.detailsHeader, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={onGoBack} activeOpacity={0.7} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.detailsContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.detailsTitle, { color: colors.text }]}>Privacidade</Text>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.notificationItem}>
            <Text style={[styles.notificationLabel, { color: colors.text }]}>Perfil Privado</Text>
            <Switch
              value={privateProfile}
              onValueChange={setPrivateProfile}
              trackColor={{ false: colors.border, true: '#4A90E2' }}
              thumbColor={privateProfile ? '#4A90E2' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.notificationItem}>
            <Text style={[styles.notificationLabel, { color: colors.text }]}>Mostrar Status Online</Text>
            <Switch
              value={showOnlineStatus}
              onValueChange={setShowOnlineStatus}
              trackColor={{ false: colors.border, true: '#4A90E2' }}
              thumbColor={showOnlineStatus ? '#4A90E2' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const ProfileScreen = ({ user, onLogout, isDark, onToggleDarkMode, onNavigateToSettings }) => {
  const colors = getThemeColors(isDark);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.profileHeader, { backgroundColor: colors.primary }]}>
        <View style={styles.profileHeaderTop}>
          <Text style={[styles.profileTitle, { color: '#FFFFFF' }]}>Meu Perfil</Text>
          <TouchableOpacity 
            onPress={onToggleDarkMode}
            style={[styles.themeToggleButton, { backgroundColor: 'rgba(255,255,255,0.3)' }]}
          >
            <Text style={styles.themeToggleText}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
        </View>
        <Text style={[styles.email, { color: colors.text }]}>{user?.email}</Text>
        <Text style={[styles.uid, { color: colors.textSecondary }]}>UID: {user?.uid?.substring(0, 10)}...</Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Seguidores</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Seguindo</Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => onNavigateToSettings('editProfile')}
          activeOpacity={0.7}
        >
          <Text style={[styles.menuItemText, { color: colors.text }]}>⚙️ Editar Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => onNavigateToSettings('notifications')}
          activeOpacity={0.7}
        >
          <Text style={[styles.menuItemText, { color: colors.text }]}>🔔 Notificações</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => onNavigateToSettings('privacy')}
          activeOpacity={0.7}
        >
          <Text style={[styles.menuItemText, { color: colors.text }]}>🔒 Privacidade</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileFooter}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Lucas Almeida - RA 22403149</Text>
      </View>
    </ScrollView>
  );
};



export default function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('login');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDark, setIsDark] = useState(false);

  const handleLoginSuccess = (newUser) => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    Alert.alert('Confirmar', 'Deseja sair?', [
      { text: 'Cancelar' },
      {
        text: 'Sair',
        onPress: async () => {
          await logout();
          setCurrentScreen('login');
        }
      }
    ]);
  };

  const handleNavigateToDetails = (post) => {
    setSelectedPost(post);
    setCurrentScreen('details');
  };

  const handleGoBack = () => {
    setCurrentScreen('dashboard');
    setSelectedPost(null);
  };

  const handleNavigateToSettings = (screen) => {
    setCurrentScreen(screen);
  };

  const handleBackFromSettings = () => {
    setCurrentScreen('profile');
  };

  const colors = getThemeColors(isDark);

  return (
    <View style={[styles.appContainer, { backgroundColor: colors.background }]}>
      {currentScreen === 'login' && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} isDark={isDark} />
      )}

      {currentScreen === 'dashboard' && (
        <View style={styles.screenContainer}>
          <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.tab, styles.activeTab, { borderBottomColor: colors.primary }]}
              onPress={() => setCurrentScreen('dashboard')}
            >
              <Text style={[styles.tabText, { color: colors.text }]}>🏠 Início</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, { borderBottomColor: 'transparent' }]}
              onPress={() => setCurrentScreen('profile')}
            >
              <Text style={[styles.tabText, { color: colors.textSecondary }]}>👤 Perfil</Text>
            </TouchableOpacity>
          </View>
          <DashboardScreen
            onNavigateToDetails={handleNavigateToDetails}
            onLogout={handleLogout}
            isDark={isDark}
          />
        </View>
      )}

      {currentScreen === 'details' && selectedPost && (
        <PostDetailsScreen post={selectedPost} onGoBack={handleGoBack} isDark={isDark} />
      )}

      {currentScreen === 'profile' && (
        <View style={styles.screenContainer}>
          <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.tab, { borderBottomColor: 'transparent' }]}
              onPress={() => setCurrentScreen('dashboard')}
            >
              <Text style={[styles.tabText, { color: colors.textSecondary }]}>🏠 Início</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, styles.activeTab, { borderBottomColor: colors.primary }]}
              onPress={() => setCurrentScreen('profile')}
            >
              <Text style={[styles.tabText, { color: colors.text }]}>👤 Perfil</Text>
            </TouchableOpacity>
          </View>
          <ProfileScreen 
            user={user} 
            onLogout={handleLogout} 
            isDark={isDark}
            onToggleDarkMode={() => setIsDark(!isDark)}
            onNavigateToSettings={handleNavigateToSettings}
          />
        </View>
      )}

      {currentScreen === 'editProfile' && (
        <EditProfileScreen user={user} onGoBack={handleBackFromSettings} isDark={isDark} />
      )}

      {currentScreen === 'notifications' && (
        <NotificationsScreen onGoBack={handleBackFromSettings} isDark={isDark} />
      )}

      {currentScreen === 'privacy' && (
        <PrivacyScreen onGoBack={handleBackFromSettings} isDark={isDark} />
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  appContainer: { flex: 1 },
  screenContainer: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#999' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  form: { borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: 1 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#4A90E2', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  toggleText: { fontSize: 14, textAlign: 'center', marginTop: 16, textDecorationLine: 'underline' },
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { fontSize: 12 },
  dashboardHeader: { padding: 20, paddingTop: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dashboardTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  dashboardSubtitle: { fontSize: 14 },
  logoutHeaderButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  logoutHeaderText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  listContent: { paddingVertical: 8 },
  card: { borderRadius: 12, padding: 16, marginHorizontal: 16, marginVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  postId: { fontSize: 12, fontWeight: 'bold' },
  userId: { fontSize: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  cardFooter: { alignItems: 'flex-end' },
  readMore: { fontSize: 12, fontWeight: '600' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  retryButton: { backgroundColor: '#4A90E2', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  retryButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  detailsHeader: { paddingHorizontal: 16, paddingVertical: 12 },
  backButtonContainer: { paddingVertical: 8, paddingHorizontal: 8, marginLeft: -8 },
  backButton: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  detailsContent: { padding: 16 },
  postInfo: { borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1 },
  postNumber: { fontSize: 14, fontWeight: 'bold' },
  userInfo: { fontSize: 12, marginTop: 4 },
  detailsTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, lineHeight: 28 },
  divider: { height: 1, marginVertical: 16 },
  bodyLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  detailsBody: { fontSize: 16, lineHeight: 24, marginBottom: 16, padding: 12, borderRadius: 8, borderWidth: 1 },
  metadata: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  metadataItem: { flex: 1, padding: 12, borderRadius: 8, marginRight: 8, borderWidth: 1 },
  metadataLabel: { fontSize: 12, marginBottom: 4 },
  metadataValue: { fontSize: 16, fontWeight: 'bold' },
  detailsFooter: { alignItems: 'center', paddingVertical: 20, borderTopWidth: 1 },
  profileHeader: { padding: 20, paddingTop: 10 },
  profileHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileTitle: { fontSize: 24, fontWeight: 'bold' },
  themeToggleButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  themeToggleText: { fontSize: 18 },
  profileCard: { margin: 16, borderRadius: 12, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: 1 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  email: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  uid: { fontSize: 12, marginBottom: 16 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4 },
  section: { borderRadius: 12, marginHorizontal: 16, marginVertical: 8, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: 1 },
  menuItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  menuItemText: { fontSize: 16 },
  notificationItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  notificationLabel: { fontSize: 16 },
  logoutButton: { backgroundColor: '#E74C3C', paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', margin: 16, borderRadius: 8 },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  profileFooter: { alignItems: 'center', paddingVertical: 20, marginTop: 20 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomWidth: 3 },
  tabText: { fontSize: 14, fontWeight: '600' }
});

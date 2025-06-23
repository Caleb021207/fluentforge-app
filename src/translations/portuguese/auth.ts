
import { TranslationRecord } from "../types";

const authTranslations: TranslationRecord = {
  // Authentication
  signIn: "Entrar",
  signUp: "Cadastrar",
  signOut: "Sair",
  logout: "Sair",
  login: "Entrar",
  register: "Cadastrar",
  
  // Form fields
  email: "Email",
  password: "Senha",
  confirmPassword: "Confirmar Senha",
  accessCode: "Código de Acesso",
  accessPasscode: "Código de Acesso",
  
  // Auth flow
  signInToContinue: "Entre para continuar",
  createAccountToGetStarted: "Crie uma conta para começar",
  dontHaveAnAccount: "Não tem uma conta?",
  alreadyHaveAnAccount: "Já tem uma conta?",
  forgotPassword: "Esqueceu a senha?",
  resetPassword: "Redefinir Senha",
  
  // Auth states
  signingIn: "Entrando...",
  signingUp: "Cadastrando...",
  signedInAs: "Conectado como",
  
  // Auth errors
  incorrectPasscode: "Código de acesso incorreto",
  retrying: "Tentando novamente",
  authenticationRequired: "Autenticação necessária",
  authRequired: "Autenticação necessária",
  pleaseSignInToViewProfile: "Por favor, entre para ver seu perfil",
  pleaseLoginToAccessThisFeature: "Por favor, faça login para acessar este recurso",
  
  // Success messages
  signInSuccessful: "Login realizado com sucesso",
  signUpSuccessful: "Cadastro realizado com sucesso",
  passwordResetSent: "Email de redefinição de senha enviado"
};

export default authTranslations;

<script lang="ts">
  import { userStore } from "$lib/stores/user.svelte.js";
  import { Eye, EyeOff, Mail, Lock, User, Check, ArrowLeft, UserPlus } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { toast } from "$lib/components/ui/toast/index.js";
  import type { RegisterData } from "$lib/user-types.js";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Card from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';

  // Reactive state using Svelte 5 runes
  let username = $state("");
  let email = $state("");
  let displayName = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let acceptTerms = $state(false);
  let newsletter = $state(false);
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);
  let isSubmitting = $state(false);

  // Form validation errors
  let usernameError = $state("");
  let emailError = $state("");
  let displayNameError = $state("");
  let passwordError = $state("");
  let confirmPasswordError = $state("");
  let termsError = $state("");

  // Password strength indicator
  let passwordStrength = $derived(() => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    let feedback = [];

    if (password.length >= 8) score++;
    else feedback.push("At least 8 characters");

    if (/[a-z]/.test(password)) score++;
    else feedback.push("Lowercase letter");

    if (/[A-Z]/.test(password)) score++;
    else feedback.push("Uppercase letter");

    if (/\d/.test(password)) score++;
    else feedback.push("Number");

    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push("Special character");

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = [
      "bg-destructive",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ];

    return {
      score,
      label: labels[score] || "Very Weak",
      color: colors[score] || "bg-destructive",
      feedback,
    };
  });

  // Computed validation
  let isFormValid = $derived(
    username.length > 0 &&
      email.length > 0 &&
      displayName.length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      acceptTerms &&
      usernameError === "" &&
      emailError === "" &&
      displayNameError === "" &&
      passwordError === "" &&
      confirmPasswordError === "" &&
      termsError === ""
  );

  function validateUsername() {
    if (!username) {
      usernameError = "Username is required";
    } else if (username.length < 3) {
      usernameError = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      usernameError = "Username can only contain letters, numbers, and underscores";
    } else {
      usernameError = "";
    }
  }

  function validateDisplayName() {
    if (!displayName) {
      displayNameError = "Display name is required";
    } else if (displayName.length < 2) {
      displayNameError = "Display name must be at least 2 characters";
    } else {
      displayNameError = "";
    }
  }

  function validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      emailError = "Email is required";
    } else if (!emailRegex.test(email)) {
      emailError = "Please enter a valid email address";
    } else {
      emailError = "";
    }
  }

  function validatePassword() {
    if (!password) {
      passwordError = "Password is required";
    } else if (password.length < 8) {
      passwordError = "Password must be at least 8 characters";
    } else {
      passwordError = "";
    }
  }

  function validateConfirmPassword() {
    if (!confirmPassword) {
      confirmPasswordError = "Please confirm your password";
    } else if (password !== confirmPassword) {
      confirmPasswordError = "Passwords do not match";
    } else {
      confirmPasswordError = "";
    }
  }

  function validateTerms() {
    if (!acceptTerms) {
      termsError = "You must accept the terms and conditions";
    } else {
      termsError = "";
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    // Validate all fields
    validateUsername();
    validateEmail();
    validateDisplayName();
    validatePassword();
    validateConfirmPassword();
    validateTerms();

    if (!isFormValid) {
      toast.error("Please fix the errors in the form");
      return;
    }

    isSubmitting = true;

    try {
      const registerData: RegisterData = {
        username,
        email,
        displayName,
        password,
        confirmPassword,
        acceptTerms,
        newsletter,
      };

      await userStore.register(registerData);
      toast.success("Account created successfully! Welcome to TVDom!");
      goto("/");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      isSubmitting = false;
    }
  }

  function goBack() {
    history.back();
  }
</script>

<svelte:head>
  <title>Sign Up - TVDom</title>
  <meta name="description" content="Create your TVDom account to track movies and TV shows" />
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-background via-muted/30 to-background">
  <!-- Background decoration -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
  </div>

  <div class="relative container mx-auto px-4 py-8 md:py-12">
    <!-- Back button -->
    <div class="mb-6">
      <Button
        variant="ghost"
        onclick={goBack}
        class="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft class="w-4 h-4" />
        Back
      </Button>
    </div>

    <div class="max-w-md mx-auto">
      <Card.Root class="border-border/60 bg-card/80 backdrop-blur-sm shadow-xl">
        <Card.Header class="text-center pb-6">
          <div class="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserPlus class="w-8 h-8 text-primary" />
          </div>
          <Card.Title class="text-2xl md:text-3xl font-bold">Create Account</Card.Title>
          <Card.Description class="text-muted-foreground">
            Join TVDom to track your favorite movies and shows
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <form onsubmit={handleSubmit} class="space-y-4">
            <!-- Username -->
            <div class="space-y-2">
              <label for="username" class="text-sm font-medium text-foreground">
                Username
              </label>
              <div class="relative">
                <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  bind:value={username}
                  onblur={validateUsername}
                  class="pl-10 {usernameError ? 'border-destructive' : ''}"
                  placeholder="Choose a username"
                  required
                />
              </div>
              {#if usernameError}
                <p class="text-sm text-destructive">{usernameError}</p>
              {/if}
            </div>

            <!-- Display Name -->
            <div class="space-y-2">
              <label for="displayName" class="text-sm font-medium text-foreground">
                Display Name
              </label>
              <div class="relative">
                <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  bind:value={displayName}
                  onblur={validateDisplayName}
                  class="pl-10 {displayNameError ? 'border-destructive' : ''}"
                  placeholder="Your display name"
                  required
                />
              </div>
              {#if displayNameError}
                <p class="text-sm text-destructive">{displayNameError}</p>
              {/if}
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <label for="email" class="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  bind:value={email}
                  onblur={validateEmail}
                  class="pl-10 {emailError ? 'border-destructive' : ''}"
                  placeholder="Enter your email"
                  required
                />
              </div>
              {#if emailError}
                <p class="text-sm text-destructive">{emailError}</p>
              {/if}
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <label for="password" class="text-sm font-medium text-foreground">
                Password
              </label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  bind:value={password}
                  onblur={validatePassword}
                  class="pl-10 pr-10 {passwordError ? 'border-destructive' : ''}"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onclick={() => (showPassword = !showPassword)}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {#if showPassword}
                    <EyeOff class="w-4 h-4" />
                  {:else}
                    <Eye class="w-4 h-4" />
                  {/if}
                </button>
              </div>
              {#if passwordError}
                <p class="text-sm text-destructive">{passwordError}</p>
              {/if}
              
              <!-- Password Strength -->
              {#if password}
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">Password strength:</span>
                    <Badge variant="outline" class={passwordStrength().color + " text-white border-0"}>
                      {passwordStrength().label}
                    </Badge>
                  </div>
                  <div class="w-full bg-muted rounded-full h-2">
                    <div
                      class="h-2 rounded-full transition-all duration-300 {passwordStrength().color}"
                      style="width: {(passwordStrength().score / 5) * 100}%"
                    ></div>
                  </div>
                </div>
              {/if}
            </div>

            <!-- Confirm Password -->
            <div class="space-y-2">
              <label for="confirmPassword" class="text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  bind:value={confirmPassword}
                  onblur={validateConfirmPassword}
                  class="pl-10 pr-10 {confirmPasswordError ? 'border-destructive' : ''}"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onclick={() => (showConfirmPassword = !showConfirmPassword)}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {#if showConfirmPassword}
                    <EyeOff class="w-4 h-4" />
                  {:else}
                    <Eye class="w-4 h-4" />
                  {/if}
                </button>
              </div>
              {#if confirmPasswordError}
                <p class="text-sm text-destructive">{confirmPasswordError}</p>
              {/if}
            </div>

            <!-- Terms and Conditions -->
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <input
                  id="accept-terms"
                  type="checkbox"
                  bind:checked={acceptTerms}
                  onchange={validateTerms}
                  class="mt-1 w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                  required
                />
                <label for="accept-terms" class="text-sm text-muted-foreground leading-relaxed">
                  I agree to the <a href="/terms" class="text-primary hover:underline">Terms of Service</a> 
                  and <a href="/privacy" class="text-primary hover:underline">Privacy Policy</a>
                </label>
              </div>
              {#if termsError}
                <p class="text-sm text-destructive">{termsError}</p>
              {/if}

              <!-- Newsletter -->
              <div class="flex items-start gap-3">
                <input
                  id="newsletter"
                  type="checkbox"
                  bind:checked={newsletter}
                  class="mt-1 w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                />
                <label for="newsletter" class="text-sm text-muted-foreground leading-relaxed">
                  Send me updates about new features and content recommendations
                </label>
              </div>
            </div>

            <!-- Submit Button -->
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              class="w-full gap-2 py-6 text-base font-semibold"
            >
              {#if isSubmitting}
                <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              {:else}
                <UserPlus class="w-5 h-5" />
                Create Account
              {/if}
            </Button>
          </form>
        </Card.Content>

        <Card.Footer class="text-center">
          <p class="text-sm text-muted-foreground">
            Already have an account? 
            <a href="/login" class="text-primary hover:underline font-medium">
              Sign in here
            </a>
          </p>
        </Card.Footer>
      </Card.Root>
    </div>
  </div>
</div>
   
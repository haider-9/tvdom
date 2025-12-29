<script lang="ts">
  import { userStore } from "$lib/stores/user.svelte.js";
  import { Eye, EyeOff, Mail, Lock, User, Check } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { toast } from "$lib/components/ui/toast/index.js";
  import type { RegisterData } from "$lib/user-types.js";
  import Button from "$lib/components/ui/button/button.svelte";

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
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ];

    return {
      score,
      label: labels[score] || "Very Weak",
      color: colors[score] || "bg-red-500",
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
      usernameError =
        "Username can only contain letters, numbers, and underscores";
    } else {
      usernameError = "";
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

  function validateDisplayName() {
    if (!displayName) {
      displayNameError = "Display name is required";
    } else if (displayName.length < 2) {
      displayNameError = "Display name must be at least 2 characters";
    } else {
      displayNameError = "";
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
    validateConfirmPassword();
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

  async function handleSubmit(event: Event) {
    event.preventDefault();

    validateUsername();
    validateEmail();
    validateDisplayName();
    validatePassword();
    validateConfirmPassword();
    validateTerms();

    if (!isFormValid) {
      toast.error("Please fix the form errors before submitting");
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

      await toast.promise(userStore.register(registerData), {
        loading: "Creating your account...",
        success: "Account created successfully! Welcome to TVDom!",
        error: (error) =>
          `Registration failed: ${error.message || "Please try again"}`,
      });

      // Small delay to show success message before redirect
      setTimeout(() => {
        goto("/profile");
      }, 1000);
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Sign Up - TVDom</title>
</svelte:head>

<div
  class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-bold">Create your account</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        <a href="/login" class="font-medium underline">
          sign in to your existing account
        </a>
      </p>
    </div>

    <form class="mt-8 space-y-6" onsubmit={handleSubmit}>
      <div class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium">
            Username
          </label>
          <div class="mt-1 relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <User class="h-5 w-5" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              autocomplete="username"
              required
              bind:value={username}
              onblur={validateUsername}
              class="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Choose a username"
            />
          </div>
          {#if usernameError}
            <p class="mt-1 text-sm text-red-600">{usernameError}</p>
          {/if}
        </div>

        <div>
          <label for="displayName" class="block text-sm font-medium">
            Display Name
          </label>
          <div class="mt-1 relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <User class="h-5 w-5" />
            </div>
            <input
              id="displayName"
              name="displayName"
              type="text"
              autocomplete="name"
              required
              bind:value={displayName}
              onblur={validateDisplayName}
              class="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Your display name"
            />
          </div>
          {#if displayNameError}
            <p class="mt-1 text-sm text-red-600">{displayNameError}</p>
          {/if}
        </div>

        <div>
          <label for="email" class="block text-sm font-medium">
            Email address
          </label>
          <div class="mt-1 relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <Mail class="h-5 w-5 " />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              bind:value={email}
              onblur={validateEmail}
              class="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter your email"
            />
          </div>
          {#if emailError}
            <p class="mt-1 text-sm text-red-600">{emailError}</p>
          {/if}
        </div>

        <div>
          <label for="password" class="block text-sm font-medium">
            Password
          </label>
          <div class="mt-1 relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <Lock class="h-5 w-5" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autocomplete="new-password"
              required
              bind:value={password}
              onblur={validatePassword}
              class="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Create a password"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              onclick={() => (showPassword = !showPassword)}
            >
              {#if showPassword}
                <EyeOff class="h-5 w-5 " />
              {:else}
                <Eye class="h-5 w-5 " />
              {/if}
            </button>
          </div>
          {#if passwordError}
            <p class="mt-1 text-sm text-red-600">{passwordError}</p>
          {/if}

          {#if password && passwordStrength().score > 0}
            <div class="mt-2">
              <div class="flex items-center justify-between text-xs">
                <span>Password strength:</span>
                <span class="font-medium">{passwordStrength().label}</span>
              </div>
              <div class="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300 {passwordStrength()
                    .color}"
                  style="width: {(passwordStrength().score / 5) * 100}%"
                ></div>
              </div>
            </div>
          {/if}
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium">
            Confirm Password
          </label>
          <div class="mt-1 relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <Lock class="h-5 w-5" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autocomplete="new-password"
              required
              bind:value={confirmPassword}
              onblur={validateConfirmPassword}
              class="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              onclick={() => (showConfirmPassword = !showConfirmPassword)}
            >
              {#if showConfirmPassword}
                <EyeOff class="h-5 w-5 " />
              {:else}
                <Eye class="h-5 w-5 " />
              {/if}
            </button>
          </div>
          {#if confirmPasswordError}
            <p class="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
          {/if}
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center">
          <input
            id="accept-terms"
            name="accept-terms"
            type="checkbox"
            required
            bind:checked={acceptTerms}
            onchange={validateTerms}
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="accept-terms" class="ml-2 block text-sm">
            I agree to the
            <button type="button" class="underline">Terms and Conditions</button
            >
            and
            <button type="button" class="underline">Privacy Policy</button>
          </label>
        </div>
        {#if termsError}
          <p class="text-sm text-red-600">{termsError}</p>
        {/if}

        <div class="flex items-center">
          <input
            id="newsletter"
            name="newsletter"
            type="checkbox"
            bind:checked={newsletter}
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="newsletter" class="ml-2 block text-sm">
            Send me updates about new features and content
          </label>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          variant="default"
          disabled={!isFormValid || isSubmitting}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isSubmitting}
            Creating account...
          {:else}
            Create account
          {/if}
        </Button>
      </div>
    </form>
  </div>
</div>

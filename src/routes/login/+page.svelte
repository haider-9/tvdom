<script lang="ts">
	import { userStore } from '$lib/stores/user.svelte';
	import { Eye, EyeOff, Mail, Lock, ArrowLeft, LogIn } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/components/ui/toast/index.js';
	import type { LoginCredentials } from '$lib/user-types.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';

	// Reactive state using Svelte 5 runes
	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let showPassword = $state(false);
	let isSubmitting = $state(false);

	// Form validation
	let emailError = $state('');
	let passwordError = $state('');

	// Computed validation
	let isFormValid = $derived(
		email.length > 0 &&
		password.length > 0 &&
		emailError === '' &&
		passwordError === ''
	);

	function validateEmail() {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email) {
			emailError = 'Email is required';
		} else if (!emailRegex.test(email)) {
			emailError = 'Please enter a valid email address';
		} else {
			emailError = '';
		}
	}

	function validatePassword() {
		if (!password) {
			passwordError = 'Password is required';
		} else if (password.length < 6) {
			passwordError = 'Password must be at least 6 characters';
		} else {
			passwordError = '';
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		
		validateEmail();
		validatePassword();
		
		if (!isFormValid) return;

		isSubmitting = true;

		try {
			const credentials: LoginCredentials = {
				email,
				password,
				rememberMe
			};

			await toast.promise(
				userStore.login(credentials),
				{
					loading: 'Signing you in...',
					success: 'Welcome back! Redirecting to your profile...',
					error: (error) => `Login failed: ${error.message || 'Please check your credentials'}`
				}
			);

			// Small delay to show success message before redirect
			setTimeout(() => {
				goto('/profile');
			}, 1000);
		} catch (error) {
			console.error('Login failed:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function fillDemoCredentials() {
		email = 'demo@tvdom.com';
		password = 'password';
		toast.info('Demo credentials filled in');
	}

	function goBack() {
		history.back();
	}
</script>

<svelte:head>
	<title>Sign In - TVDom</title>
	<meta name="description" content="Sign in to your TVDom account to access your watchlist and ratings" />
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
						<LogIn class="w-8 h-8 text-primary" />
					</div>
					<Card.Title class="text-2xl md:text-3xl font-bold">Welcome Back</Card.Title>
					<Card.Description class="text-muted-foreground">
						Sign in to your TVDom account to continue your journey
					</Card.Description>
				</Card.Header>
				
				<Card.Content>
					<form onsubmit={handleSubmit} class="space-y-4">
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
									autocomplete="email"
									required
									bind:value={email}
									onblur={validateEmail}
									class="pl-10 {emailError ? 'border-destructive' : ''}"
									placeholder="Enter your email"
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
									type={showPassword ? 'text' : 'password'}
									autocomplete="current-password"
									required
									bind:value={password}
									onblur={validatePassword}
									class="pl-10 pr-10 {passwordError ? 'border-destructive' : ''}"
									placeholder="Enter your password"
								/>
								<button
									type="button"
									class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									onclick={() => showPassword = !showPassword}
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
						</div>

						<!-- Remember me and forgot password -->
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<input
									id="remember-me"
									type="checkbox"
									bind:checked={rememberMe}
									class="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
								/>
								<label for="remember-me" class="text-sm text-muted-foreground">
									Remember me
								</label>
							</div>
							<button
								type="button"
								class="text-sm text-primary hover:text-primary/80 transition-colors"
							>
								Forgot password?
							</button>
						</div>

						<!-- Submit Button -->
						<Button
							type="submit"
							disabled={!isFormValid || isSubmitting}
							class="w-full gap-2 py-6 text-base font-semibold"
						>
							{#if isSubmitting}
								<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
								Signing in...
							{:else}
								<LogIn class="w-5 h-5" />
								Sign In
							{/if}
						</Button>

						<!-- Demo credentials -->
						<div class="text-center">
							<button
								type="button"
								onclick={fillDemoCredentials}
								class="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								Try demo credentials
							</button>
						</div>
					</form>
				</Card.Content>

				<Card.Footer class="text-center">
					<p class="text-sm text-muted-foreground">
						Don't have an account? 
						<a href="/signup" class="text-primary hover:underline font-medium">
							Sign up here
						</a>
					</p>
				</Card.Footer>
			</Card.Root>
		</div>
	</div>
</div>
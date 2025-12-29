<script lang="ts">
	import { userStore } from '$lib/stores/user.svelte.js';
	import { Eye, EyeOff, Mail, Lock, X } from 'lucide-svelte';
	import type { LoginCredentials } from '$lib/user-types.js';

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

	// Demo credentials hint
	let showDemoHint = $state(true);

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
		if (!isFormValid || isSubmitting) return;

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

			await userStore.login(credentials);

			if (userStore.isAuthenticated) {
				userStore.closeLoginModal();
				// Reset form
				email = '';
				password = '';
				rememberMe = false;
				showPassword = false;
			}
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		userStore.closeLoginModal();
		// Clear form and errors
		email = '';
		password = '';
		emailError = '';
		passwordError = '';
		rememberMe = false;
		showPassword = false;
	}

	function switchToRegister() {
		userStore.openRegisterModal();
	}

	function fillDemoCredentials() {
		email = 'demo@tvdom.com';
		password = 'password';
		showDemoHint = false;
	}

	// Handle escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if userStore.isLoginModalOpen}
	<!-- Modal backdrop -->
	<div
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-labelledby="login-title"
		aria-modal="true"
	>
		<!-- Invisible backdrop button for closing -->
		<button
			class="absolute inset-0 w-full h-full cursor-default"
			onclick={handleClose}
			onkeydown={(e) => e.key === 'Escape' && handleClose()}
			aria-label="Close modal"
			tabindex="-1"
		></button>
		<!-- Modal content -->
		<div
			class="rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 relative z-10"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
				<div>
					<h2 id="login-title" class="text-2xl font-bold text-gray-900 dark:text-white">
						Welcome back
					</h2>
					<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
						Sign in to your account
					</p>
				</div>
				<button
					onclick={handleClose}
					class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
					aria-label="Close modal"
				>
					<X class="w-5 h-5 text-gray-500" />
				</button>
			</div>

			<!-- Form -->
			<form onsubmit={handleSubmit} class="p-6 space-y-6">
				{#if showDemoHint}
					<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
						<div class="flex items-start">
							<div class="flex-shrink-0">
								<Mail class="w-5 h-5 text-blue-500" />
							</div>
							<div class="ml-3">
								<h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
									Demo Account
								</h3>
								<p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
									Try the demo with email: <code class="bg-blue-100 dark:bg-blue-800 px-1 rounded">demo@tvdom.com</code> and password: <code class="bg-blue-100 dark:bg-blue-800 px-1 rounded">password</code>
								</p>
								<button
									type="button"
									onclick={fillDemoCredentials}
									class="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
								>
									Fill demo credentials
								</button>
							</div>
						</div>
					</div>
				{/if}

				{#if userStore.error}
					<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<X class="w-5 h-5 text-red-500" />
							</div>
							<div class="ml-3">
								<p class="text-sm text-red-700 dark:text-red-300">{userStore.error}</p>
							</div>
						</div>
					</div>
				{/if}

				<!-- Email field -->
				<div class="space-y-2">
					<label for="login-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Email address
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Mail class="w-5 h-5 text-gray-400" />
						</div>
						<input
							id="login-email"
							type="email"
							bind:value={email}
							oninput={validateEmail}
							placeholder="Enter your email"
							class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
								focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
								bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
								{emailError ? 'border-red-500 focus:ring-red-500' : ''}"
							required
							autocomplete="email"
						/>
					</div>
					{#if emailError}
						<p class="text-sm text-red-600 dark:text-red-400">{emailError}</p>
					{/if}
				</div>

				<!-- Password field -->
				<div class="space-y-2">
					<label for="login-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Password
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock class="w-5 h-5 text-gray-400" />
						</div>
						<input
							id="login-password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							oninput={validatePassword}
							placeholder="Enter your password"
							class="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
								focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
								bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
								{passwordError ? 'border-red-500 focus:ring-red-500' : ''}"
							required
							autocomplete="current-password"
						/>
						<button
							type="button"
							onclick={() => showPassword = !showPassword}
							class="absolute inset-y-0 right-0 pr-3 flex items-center"
							aria-label={showPassword ? 'Hide password' : 'Show password'}
						>
							{#if showPassword}
								<EyeOff class="w-5 h-5 text-gray-400 hover:text-gray-600" />
							{:else}
								<Eye class="w-5 h-5 text-gray-400 hover:text-gray-600" />
							{/if}
						</button>
					</div>
					{#if passwordError}
						<p class="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
					{/if}
				</div>

				<!-- Remember me and forgot password -->
				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<input
							id="remember-me"
							type="checkbox"
							bind:checked={rememberMe}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label for="remember-me" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
							Remember me
						</label>
					</div>
					<button
						type="button"
						class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
					>
						Forgot password?
					</button>
				</div>

				<!-- Submit button -->
				<button
					type="submit"
					disabled={!isFormValid || isSubmitting}
					class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white
						bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
						disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600
						transition-colors duration-200"
				>
					{#if isSubmitting}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Signing in...
					{:else}
						Sign in
					{/if}
				</button>

				<!-- Register link -->
				<div class="text-center">
					<p class="text-sm text-gray-600 dark:text-gray-400">
						Don't have an account?
						<button
							type="button"
							onclick={switchToRegister}
							class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
						>
							Sign up
						</button>
					</p>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbar for modal content */
	.modal-content {
		scrollbar-width: thin;
		scrollbar-color: rgb(156 163 175) transparent;
	}

	.modal-content::-webkit-scrollbar {
		width: 6px;
	}

	.modal-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.modal-content::-webkit-scrollbar-thumb {
		background-color: rgb(156 163 175);
		border-radius: 3px;
	}
</style>

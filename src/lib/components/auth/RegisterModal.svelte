<script lang="ts">
	import { userStore } from '$lib/stores/user.svelte.js';
	import { Eye, EyeOff, Mail, Lock, User, X, Check } from 'lucide-svelte';
	import type { RegisterData } from '$lib/user-types.js';

	// Reactive state using Svelte 5 runes
	let username = $state('');
	let email = $state('');
	let displayName = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let acceptTerms = $state(false);
	let newsletter = $state(false);
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let isSubmitting = $state(false);

	// Form validation errors
	let usernameError = $state('');
	let emailError = $state('');
	let displayNameError = $state('');
	let passwordError = $state('');
	let confirmPasswordError = $state('');
	let termsError = $state('');

	// Password strength indicator
	let passwordStrength = $derived(() => {
		if (!password) return { score: 0, label: '', color: '' };

		let score = 0;
		let feedback = [];

		if (password.length >= 8) score++;
		else feedback.push('At least 8 characters');

		if (/[a-z]/.test(password)) score++;
		else feedback.push('Lowercase letter');

		if (/[A-Z]/.test(password)) score++;
		else feedback.push('Uppercase letter');

		if (/\d/.test(password)) score++;
		else feedback.push('Number');

		if (/[^a-zA-Z0-9]/.test(password)) score++;
		else feedback.push('Special character');

		const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
		const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

		return {
			score,
			label: labels[score] || 'Very Weak',
			color: colors[score] || 'bg-red-500',
			feedback
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
		usernameError === '' &&
		emailError === '' &&
		displayNameError === '' &&
		passwordError === '' &&
		confirmPasswordError === ''
	);

	function validateUsername() {
		const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
		if (!username) {
			usernameError = 'Username is required';
		} else if (!usernameRegex.test(username)) {
			usernameError = 'Username must be 3-20 characters, letters, numbers, and underscores only';
		} else {
			usernameError = '';
		}
	}

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

	function validateDisplayName() {
		if (!displayName) {
			displayNameError = 'Display name is required';
		} else if (displayName.length < 2) {
			displayNameError = 'Display name must be at least 2 characters';
		} else if (displayName.length > 50) {
			displayNameError = 'Display name must be less than 50 characters';
		} else {
			displayNameError = '';
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

	function validateConfirmPassword() {
		if (!confirmPassword) {
			confirmPasswordError = 'Please confirm your password';
		} else if (password !== confirmPassword) {
			confirmPasswordError = 'Passwords do not match';
		} else {
			confirmPasswordError = '';
		}
	}

	function validateTerms() {
		if (!acceptTerms) {
			termsError = 'You must accept the terms and conditions';
		} else {
			termsError = '';
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!isFormValid || isSubmitting) return;

		// Validate all fields
		validateUsername();
		validateEmail();
		validateDisplayName();
		validatePassword();
		validateConfirmPassword();
		validateTerms();

		if (!isFormValid) return;

		isSubmitting = true;

		try {
			const registerData: RegisterData = {
				username,
				email,
				displayName,
				password,
				confirmPassword,
				acceptTerms,
				newsletter
			};

			await userStore.register(registerData);

			if (userStore.isAuthenticated) {
				userStore.closeRegisterModal();
				// Reset form
				resetForm();
			}
		} finally {
			isSubmitting = false;
		}
	}

	function resetForm() {
		username = '';
		email = '';
		displayName = '';
		password = '';
		confirmPassword = '';
		acceptTerms = false;
		newsletter = false;
		showPassword = false;
		showConfirmPassword = false;

		// Clear errors
		usernameError = '';
		emailError = '';
		displayNameError = '';
		passwordError = '';
		confirmPasswordError = '';
		termsError = '';
	}

	function handleClose() {
		userStore.closeRegisterModal();
		resetForm();
	}

	function switchToLogin() {
		userStore.openLoginModal();
	}

	// Handle escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}

	// Auto-fill display name from username
	$effect(() => {
		if (username && !displayName) {
			displayName = username;
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if userStore.isRegisterModalOpen}
	<!-- Modal backdrop -->
	<div
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-labelledby="register-title"
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
			class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto modal-content relative z-10"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
				<div>
					<h2 id="register-title" class="text-2xl font-bold text-gray-900 dark:text-white">
						Join TVDom
					</h2>
					<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
						Create your account to start rating and reviewing
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
				{#if userStore.error}
					<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
						<div class="flex">
							<div class="shrink-0">
								<X class="w-5 h-5 text-red-500" />
							</div>
							<div class="ml-3">
								<p class="text-sm text-red-700 dark:text-red-300">{userStore.error}</p>
							</div>
						</div>
					</div>
				{/if}

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Username field -->
					<div class="space-y-2">
						<label for="register-username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Username
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<User class="w-5 h-5 text-gray-400" />
							</div>
							<input
								id="register-username"
								type="text"
								bind:value={username}
								oninput={validateUsername}
								placeholder="Choose a username"
								class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
									focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
									bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
									{usernameError ? 'border-red-500 focus:ring-red-500' : ''}"
								required
								autocomplete="username"
							/>
						</div>
						{#if usernameError}
							<p class="text-sm text-red-600 dark:text-red-400">{usernameError}</p>
						{/if}
					</div>

					<!-- Display Name field -->
					<div class="space-y-2">
						<label for="register-display-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Display Name
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<User class="w-5 h-5 text-gray-400" />
							</div>
							<input
								id="register-display-name"
								type="text"
								bind:value={displayName}
								oninput={validateDisplayName}
								placeholder="Your display name"
								class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
									focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
									bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
									{displayNameError ? 'border-red-500 focus:ring-red-500' : ''}"
								required
								autocomplete="name"
							/>
						</div>
						{#if displayNameError}
							<p class="text-sm text-red-600 dark:text-red-400">{displayNameError}</p>
						{/if}
					</div>
				</div>

				<!-- Email field -->
				<div class="space-y-2">
					<label for="register-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Email address
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Mail class="w-5 h-5 text-gray-400" />
						</div>
						<input
							id="register-email"
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
					<label for="register-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Password
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock class="w-5 h-5 text-gray-400" />
						</div>
						<input
							id="register-password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							oninput={validatePassword}
							placeholder="Create a password"
							class="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
								focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
								bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
								{passwordError ? 'border-red-500 focus:ring-red-500' : ''}"
							required
							autocomplete="new-password"
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

					{#if password && !passwordError}
						{@const strength = passwordStrength()}
						<div class="space-y-2">
							<div class="flex justify-between items-center">
								<span class="text-sm text-gray-600 dark:text-gray-400">Password strength:</span>
								<span class="text-sm font-medium {strength.score >= 3 ? 'text-green-600' : strength.score >= 2 ? 'text-yellow-600' : 'text-red-600'}">
									{strength.label}
								</span>
							</div>
							<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
								<div
									class="h-2 rounded-full transition-all duration-300 {strength.color}"
									style="width: {(strength.score / 5) * 100}%"
								></div>
							</div>
							{#if strength.feedback && strength.feedback.length > 0 && strength.score < 4}
								<p class="text-xs text-gray-500 dark:text-gray-400">
									Missing: {strength.feedback.join(', ')}
								</p>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Confirm Password field -->
				<div class="space-y-2">
					<label for="register-confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Confirm Password
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock class="w-5 h-5 text-gray-400" />
						</div>
						<input
							id="register-confirm-password"
							type={showConfirmPassword ? 'text' : 'password'}
							bind:value={confirmPassword}
							oninput={validateConfirmPassword}
							placeholder="Confirm your password"
							class="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
								focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
								bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
								{confirmPasswordError ? 'border-red-500 focus:ring-red-500' : confirmPassword && password === confirmPassword ? 'border-green-500 focus:ring-green-500' : ''}"
							required
							autocomplete="new-password"
						/>
						<button
							type="button"
							onclick={() => showConfirmPassword = !showConfirmPassword}
							class="absolute inset-y-0 right-0 pr-3 flex items-center"
							aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
						>
							{#if showConfirmPassword}
								<EyeOff class="w-5 h-5 text-gray-400 hover:text-gray-600" />
							{:else}
								<Eye class="w-5 h-5 text-gray-400 hover:text-gray-600" />
							{/if}
						</button>
						{#if confirmPassword && password === confirmPassword && !confirmPasswordError}
							<div class="absolute inset-y-0 right-10 flex items-center">
								<Check class="w-5 h-5 text-green-500" />
							</div>
						{/if}
					</div>
					{#if confirmPasswordError}
						<p class="text-sm text-red-600 dark:text-red-400">{confirmPasswordError}</p>
					{/if}
				</div>

				<!-- Terms and Newsletter -->
				<div class="space-y-4">
					<div class="flex items-start">
						<input
							id="accept-terms"
							type="checkbox"
							bind:checked={acceptTerms}
							onchange={validateTerms}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
							required
						/>
						<label for="accept-terms" class="ml-3 text-sm text-gray-700 dark:text-gray-300">
							I agree to the <a href="/terms" class="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a>
							and <a href="/privacy" class="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>
						</label>
					</div>
					{#if termsError}
						<p class="text-sm text-red-600 dark:text-red-400 ml-7">{termsError}</p>
					{/if}

					<div class="flex items-start">
						<input
							id="newsletter"
							type="checkbox"
							bind:checked={newsletter}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
						/>
						<label for="newsletter" class="ml-3 text-sm text-gray-700 dark:text-gray-300">
							Subscribe to our newsletter for updates and recommendations
						</label>
					</div>
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
						Creating account...
					{:else}
						Create account
					{/if}
				</button>

				<!-- Login link -->
				<div class="text-center">
					<p class="text-sm text-gray-600 dark:text-gray-400">
						Already have an account?
						<button
							type="button"
							onclick={switchToLogin}
							class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
						>
							Sign in
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

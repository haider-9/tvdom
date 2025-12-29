<script lang="ts">
	import { userStore } from '$lib/stores/user.svelte.js';
	import { Eye, EyeOff, Mail, Lock } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/components/ui/toast/index.js';
	import type { LoginCredentials } from '$lib/user-types.js';
  import Button from '$lib/components/ui/button/button.svelte';

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
</script>

<svelte:head>
	<title>Sign In - TVDom</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-bold ">
				Sign in to your account
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Or
				<a href="/signup" class="font-medium underline">
					create a new account
				</a>
			</p>
		</div>
		
		<form class="mt-8 space-y-6" onsubmit={handleSubmit}>
			<div class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium ">
						Email address
					</label>
					<div class="mt-1 relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
							class="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500  rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
							placeholder="Enter your email"
						/>
					</div>
					{#if emailError}
						<p class="mt-1 text-sm text-red-600">{emailError}</p>
					{/if}
				</div>

				<div>
					<label for="password" class="block text-sm font-medium ">
						Password
					</label>
					<div class="mt-1 relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock class="h-5 w-5" />
						</div>
						<input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							autocomplete="current-password"
							required
							bind:value={password}
							onblur={validatePassword}
							class="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500  rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
							placeholder="Enter your password"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 pr-3 flex items-center"
							onclick={() => showPassword = !showPassword}
						>
							{#if showPassword}
								<EyeOff class="h-5 w-5 text-gray-400 hover:text-gray-600" />
							{:else}
								<Eye class="h-5 w-5 text-gray-400 hover:text-gray-600" />
							{/if}
						</button>
					</div>
					{#if passwordError}
						<p class="mt-1 text-sm text-red-600">{passwordError}</p>
					{/if}
				</div>
			</div>

			<div class="flex items-center justify-between">
				<div class="flex items-center">
					<input
						id="remember-me"
						name="remember-me"
						type="checkbox"
						bind:checked={rememberMe}
						class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
					/>
					<label for="remember-me" class="ml-2 block text-sm ">
						Remember me
					</label>
				</div>

				
			</div>

			<div>
				<Button
					type="submit"
					variant='default'
					disabled={!isFormValid || isSubmitting}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isSubmitting}
						Signing in...
					{:else}
						Sign in
					{/if}
			</Button>
			</div>

			
		</form>
	</div>
</div>
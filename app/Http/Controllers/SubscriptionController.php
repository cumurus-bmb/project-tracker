<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class SubscriptionController extends Controller
{
    public function pricing(): Response
    {
        return Inertia::render('Pricing', [
            'monthlyPriceId' => env('STRIPE_PRICE_MONTHLY'),
        ]);
    }

    public function checkout(Request $request, string $plan): SymfonyResponse
    {
        $checkout = $request->user()
            ->newSubscription('default', $plan)
            ->checkout([
                'success_url' => route('dashboard').'?subscribed=1',
                'cancel_url'  => route('pricing'),
            ]);

        return Inertia::location($checkout->url);
    }

    public function billingPortal(Request $request): SymfonyResponse
    {
        $url = $request->user()->billingPortalUrl(route('dashboard'));

        return Inertia::location($url);
    }
}

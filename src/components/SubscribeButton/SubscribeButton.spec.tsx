import {render, screen, fireEvent} from '@testing-library/react'
import {mocked} from 'ts-jest/utils'
import {useSession, signIn} from 'next-auth/client'
import {useRouter} from 'next/router';
import { SubscribeButton } from '.'

jest.mock('next-auth/client');
const useSessionMocked = mocked(useSession);
jest.mock('next/router')


describe('SubscribeButton component',() => {
    it('renders correctly', () => {
        useSessionMocked.mockReturnValueOnce([null, false]);

        render(<SubscribeButton />)
        expect(screen.getByText('Subscribe Now')).toBeInTheDocument();
    })

    it('redirects user to sign in when not authenticated', () => {
        const signInMocked  = mocked(signIn);
        useSessionMocked.mockReturnValueOnce([null, false]);

        render(<SubscribeButton />)

        const subscribeButton = screen.getByText('Subscribe Now');

        fireEvent.click(subscribeButton);

        expect(signInMocked).toHaveBeenCalledTimes(1);
    })

    it('redirects to posts when user already has a subscription', () => {
        useSessionMocked.mockReturnValueOnce([{
            user: {
                name: 'John Doe', 
                email: 'john.doe@example.com'
            },
            expires: 'fake-expires', 
            activeSubscription: 'fake-active-subscription'
        }, false]);

        const useRouterMocked = mocked(useRouter)

        const pushMock = jest.fn();

        useRouterMocked.mockReturnValueOnce({
            push: pushMock
        } as any);

        render(<SubscribeButton />)

        const subscribeButton = screen.getByText('Subscribe Now');

        fireEvent.click(subscribeButton);

        expect(pushMock).toHaveBeenCalledWith('/posts');
    })
});
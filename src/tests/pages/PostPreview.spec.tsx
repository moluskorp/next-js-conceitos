import {render, screen} from '@testing-library/react';
import Post, {getStaticProps} from '../../pages/posts/preview/[slug]';
import {mocked} from 'ts-jest/utils';
import {getPrismicClient} from '../../services/prismic';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

const post = 
    {
        slug: 'test-post',
        title: 'test-title-post',
        content: '<p>test-excerpt</p>',
        updatedAt: '10 de Abril'
    }


jest.mock('next-auth/client');
jest.mock('next-auth/client');
jest.mock('next/router');
jest.mock('../../services/prismic')
const useSessionMocked = mocked(useSession);
const useRouterMocked = mocked(useRouter);


describe('Post preview page', () => {
    it('redners correctly', () => {
        useSessionMocked.mockReturnValueOnce([null, false]);

        render(<Post post={post}/>)

        expect(screen.getByText('test-title-post')).toBeInTheDocument();
        expect(screen.getByText('test-excerpt')).toBeInTheDocument();
        expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
    })

    it('redirects user to full post when user is subscribed', async () => {
        const pushMock  = jest.fn();
        useSessionMocked.mockReturnValueOnce([{
            activeSubscription: 'fake-active-subscription'
        },false] as any);
        
        useRouterMocked.mockReturnValueOnce({
            push: pushMock
        }as any);

        render(<Post post={post}/>)

        expect(pushMock).toHaveBeenCalledWith('/posts/test-post')
    });

    it('loads initial data', async () => {
        const getPrismicClientMocked = mocked(getPrismicClient);
        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [{
                        type: 'heading',
                        text: 'My new post'
                    }],
                    content: [{
                        type: 'paragraph',
                        text: 'Post excerpt'
                    }],
                },
                last_publication_date: '04-01-2021'
            })
        } as any)

        const response = await getStaticProps({params: {slug: 'my-new-post'}});

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: 'my-new-post',
                        title: 'My new post',
                        content: '<p>Post excerpt</p>',
                        updatedAt: '2021 M04 01'
                    }
                }
            })
        )
    })
})
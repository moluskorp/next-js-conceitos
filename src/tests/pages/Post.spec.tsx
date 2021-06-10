import {render, screen} from '@testing-library/react';
import Post, {getServerSideProps} from '../../pages/posts/[slug]';
import {mocked} from 'ts-jest/utils';
import {getPrismicClient} from '../../services/prismic';
import { getSession } from 'next-auth/client';

const post = 
    {
        slug: 'test-post',
        title: 'test-title-post',
        content: '<p>test-excerpt</p>',
        updatedAt: '10 de Abril'
    }


jest.mock('next-auth/client');
jest.mock('../../services/prismic')
const getSessionMocked = mocked(getSession);


describe('Post page', () => {
    it('redners correctly', () => {
        render(<Post post={post}/>)

        expect(screen.getByText('test-title-post')).toBeInTheDocument();
        expect(screen.getByText('test-excerpt')).toBeInTheDocument();
    })

    it('redirects user if no subscription is found', async () => {

        getSessionMocked.mockResolvedValueOnce(null);

        
        const response = await getServerSideProps({params: {slug: 'my-new-post'}} as any);

        expect(response).toEqual(
            expect.objectContaining({
                redirect: expect.objectContaining({
                        destination: '/',
                })
            })
        )
    });

    it('loads initial data', async () => {
        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-active-subscription'
        }as any);

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

        const response = await getServerSideProps({params: {slug: 'my-new-post'}} as any);

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
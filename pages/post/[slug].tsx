import { GetStaticProps } from 'next'
import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { Post } from '../../typings'
import PortableTxt from 'react-portable-text'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useState } from 'react'

interface Props {
  post: Post
}
interface FormInput {
  _id: string
  name?: string
  email: string
  comment: string
}

const Post = ({ post }: Props) => {
  console.log(post)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>()
  const [submit, setSubmit] = useState(false)

  const onsubmit: SubmitHandler<FormInput> = (data) => {
    fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(() => {
        console.log(data)
        setSubmit(true)
      })
      .catch((err) => {
        setSubmit(false)
        console.log(err)
      })
  }
  return (
    <div>
      <Header />
      <img
        className="h-40 w-full object-cover"
        src={urlFor(post.mainImage).url()!}
        alt=""
      />

      <article className="mx-auto max-w-3xl p-5">
        <h1 className="mt-10 mb-3 text-3xl">{post.title}</h1>
        <h2 className="mb-2 text-xl font-light text-gray-500">
          {post.description}
        </h2>

        <div className="flex items-center space-x-2">
          <img
            className="h-10 w-10 rounded-full"
            src={urlFor(post.author.image).url()!}
            alt=""
          />
          <p className="text-sm font-extralight">
            Blog post by{' '}
            <span className="text-green-600">{post.author.name}</span> published
            at {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>
        <div className="mt-10">
          <PortableTxt
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            content={post.body}
            className=""
            serializers={{
              h1: (props: any) => (
                <h1 className="my-5 text-2xl font-bold" {...props} />
              ),
              h2: (props: any) => (
                <h2 className="my-5 text-xl font-bold" {...props} />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
            }}
          />
        </div>
        <hr className="my-5 mx-auto max-w-lg border-yellow-500" />
      </article>

      {submit ? (
        <div className="p -10 my-10 mx-auto flex max-w-2xl flex-col bg-yellow-500 text-white">
          <h3 className="text-3xl font-bold">thank you for submit!!</h3>
          <p>once it has been approved, it will apear below!</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onsubmit)}
          className="mx-auto mb-10 flex max-w-2xl flex-col p-5"
        >
          <h3 className="text-sm text-yellow-500">Enjoyed this Article?</h3>
          <h4 className="text-3xl font-bold">Leave comment blow!</h4>
          <hr className="mt-2 py-3" />

          <input
            {...register('_id')}
            type="hidden"
            name="_id"
            value={post._id}
          />
          <label className="mb-5 block">
            <span className="text-gray-700">Name</span>
            <input
              {...register('name', { required: true })}
              className="form-input mt-1 block w-full rounded border py-2 px-3 shadow  outline-none ring-yellow-500 focus:ring"
              placeholder="name"
              type="text"
            />
          </label>
          <label className="mb-5 block">
            <span className="text-gray-700">Email</span>
            <input
              {...register('email', { required: true })}
              className="form-input mt-1 block w-full rounded border py-2 px-3 shadow  outline-none ring-yellow-500 focus:ring"
              placeholder="Email"
              type="email"
            />
          </label>
          <label className="mb-5 block">
            <span className="text-gray-700">comments</span>
            <textarea
              {...register('comment', { required: true })}
              className="form-textarea mt-1 block w-full rounded border py-2 px-3 shadow  outline-none ring-yellow-500 focus:ring"
              placeholder="comment"
              rows={8}
            />
          </label>
          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="text-red-500">-The name field is required</span>
            )}
            {errors.comment && (
              <span className="text-red-500">
                -The comment field is required
              </span>
            )}
            {errors.email && (
              <span className="text-red-500">-The email field is required</span>
            )}
          </div>
          <input
            type="submit"
            value="submit"
            className="focus:shadow-outline cursor-pointer rounded bg-yellow-500 py-2  px-4 font-bold text-white shadow hover:bg-yellow-400 focus:outline-none"
          />
        </form>
      )}

      <div className=" my-10 mx-auto flex max-w-2xl flex-col space-y-2 p-10  shadow shadow-yellow-500 ">
        <h3 className="text-4xl">Comments</h3>
        <hr className="pb-2" />
        {post.comments.map((comment) => {
          return (
            <div className="" key={comment._id}>
              <p>
                <span className="text-yellow-500">{comment.name}:</span>{' '}
                {comment.comment}{' '}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `
    *[_type == "post"]{
      _id,
      slug{
          current
      }
    }
    `
  const posts = await sanityClient.fetch(query)

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    _createdAt,
    title,
    slug,
    mainImage,
    'comments': *[_type == "comment" && post._ref == ^._id && approved == true],
    body,
    description,
    author -> {
        name,
        image
    }
    }
    `

  const post = await sanityClient.fetch(query, { slug: params?.slug })

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60, // after 60 sec will update cache
  }
}

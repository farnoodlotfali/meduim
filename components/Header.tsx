import Image from 'next/image'
import Link from 'next/link'

const Header = () => {
  // const myloader = ({ src }): string => {
  //   return src
  // }
  return (
    <header className="mx-auto flex max-w-7xl justify-between p-5">
      <div className="flex items-center space-x-5">
        <Link href="/">
          <img
            src={'https://links.papareact.com/yvf'}
            className="w-44 cursor-pointer object-contain"
            // // loader={myloader}
            // unoptimized
            // layout="responsive"
            // loading="lazy"
            // width={170}
            // height={45}
          />
        </Link>
        <div className="hidden items-center space-x-5 md:inline-flex">
          <h3>About</h3>
          <h3>Contact</h3>
          <h3 className="rounded-full bg-green-600 px-4 py-1 text-white">
            Follow
          </h3>
        </div>
      </div>
      <div className="flex items-center space-x-5 text-green-600">
        <h3>Sign In</h3>
        <h3 className="rounded-full border border-green-600 px-4 py-1">
          Get Started
        </h3>
      </div>
    </header>
  )
}

export default Header

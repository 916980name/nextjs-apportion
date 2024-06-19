'use client'
import { UserNameComponent } from 'app/settings/username-widget';
import { usePathname, useRouter } from 'next/navigation';

function WelcomePage() {
  const router = useRouter();
  const reqPath = usePathname();

  const runJump = () => {
    router.push(reqPath);
  }

  return (
      <div>
        <div>
          <UserNameComponent handleChangeSuc={runJump}/>
        </div>
      </div>
  );
}

export default WelcomePage;
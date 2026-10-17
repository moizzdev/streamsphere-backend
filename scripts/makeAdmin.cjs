const USER = require('../model/userModel.cjs')

async function run() {
    const user = await USER.findOne({ where: { email: 'admin1@gmail.com' } })
    if (!user) {
        console.log('User not found — register this email first')
        return
    }
    await user.update({ role: 'admin' })
    console.log('Promoted to admin:', user.email)
}

run()
import { Router } from 'express'; //Import the class from express

const router = Router(); //Create a new instance of the class for use within this file.

router.post('/', (req, res) =>
{
    const { name, email } = req.body;
    Console.log(name);
    Console.log(email);
    res.redirect('/test');
})

router.get('/', (req, res) =>
{
    res.render('test', { title: 'Test' });
});

router.post('/', (req, res) => {
    const { name, email } = req.body;
    console.log(`Name: ${name} \nEmail: ${email}`);
    res.redirect('/test');
})

router.post('/login', (req, res) => {
    res.redirect('/test');
})

router.post('/logout', (req, res) => {
    res.redirect('/test');
})

export default router;
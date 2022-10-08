English | [简体中文](./README.zh-CN.md)

<p align="center">
  <br>A free/libre framework that build bridge between Emacs and Deno runtime. <br>Allows execution of JavaScript and Typescript within Emacs.
</p>

## Vision
With deno-bridge, we can execution of JavaScript and Typescript within Emacs and don't need change source code of Emacs. It's bringing TypeScript ecosystem of powerful tools and approaches that Emacs just doesn't have currently:

1. TypeScript offers an extremely flexible typing system, that allows to user to have compile time control of their scripting, with the flexibility of types "getting out of the way" when not needed.
2. Deno uses Google's v8 JavaScript engine, which features an extremely powerful JIT and world-class garbage collector.
3. Usage of modern Async I/O utilizing Rust's Tokio library.
4. WebWorker support, meaning that multiple JavaScript engines can be running in parallel within the editor. The only restriction is that only the 'main' JS Engine can directly call lisp functions.
5. WebAssembly support, compile your C module as WebAsm and distribute it to the world. Don't worry about packaging shared libraries or changing module interfaces, everything can be handled and customized by you the user, at the scripting layer. No need to be dependent on native implementation details.
6. Performance, v8's world-class JIT offers the potential for large performance gains. Async I/O from Deno, WebWorkers, and WebAsm, gives you the tools to make Emacs a smoother and faster experience without having to install additional tools to launch as background processes or worry about shared library versions.

